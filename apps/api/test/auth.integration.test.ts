import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { startTestApp, seedTestAdmin } from './support.js';

const origin = 'http://localhost:5173';
const loginPath = '/api/v1/auth/login';
const mePath = '/api/v1/auth/me';
const logoutPath = '/api/v1/auth/logout';
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
function cookies(response: request.Response): string[] {
  return (response.headers['set-cookie'] as unknown as string[]).map(value => value.split(';')[0]!);
}
function token(response: request.Response, name: string): string {
  return cookies(response).find(value => value.startsWith(`${name}=`))!.slice(name.length + 1);
}

afterEach(() => vi.restoreAllMocks());
describe('autenticação REST', () => {
  it('normaliza email, mantém sessão e CSRF estáveis, guarda somente hashes e revoga no logout', async () => {
    const test = await startTestApp();
    try {
      const admin = await seedTestAdmin(test.db);
      const agent = request.agent(test.app.getHttpServer());
      const login = await agent.post(loginPath).set('Origin', origin).send({ ...admin, email: ` ${admin.email.toUpperCase()} ` }).expect(200);
      expect(login.body).toEqual({ user: { id: expect.any(String), email: admin.email }, csrfToken: expect.stringMatching(/^[0-9a-f]{64}$/) });
      expect(login.headers['cache-control']).toBe('no-store');
      const setCookie = login.headers['set-cookie'] as unknown as string[];
      expect(setCookie).toHaveLength(2);
      for (const value of setCookie) {
        expect(value).toContain('HttpOnly'); expect(value).toContain('SameSite=Lax');
        expect(value).toContain('Path=/'); expect(value).toContain('Max-Age=28800');
      }
      const session = await test.db.session.findFirstOrThrow();
      expect(session.tokenHash).toBe(digest(token(login, 'forge_session')));
      expect(session.csrfHash).toBe(digest(login.body.csrfToken));
      expect(token(login, 'forge_csrf')).toBe(login.body.csrfToken);
      expect(session.expiresAt.getTime() - Date.now()).toBeGreaterThan(28_700_000);
      for (let i = 0; i < 2; i++) {
        const me = await agent.get(mePath).expect(200);
        expect(me.body).toEqual(login.body);
        expect(me.headers['set-cookie']).toBeUndefined();
      }
      await agent.post(logoutPath).set('Origin', origin).expect(403);
      await agent.post(logoutPath).set('Origin', 'https://evil.example').set('X-CSRF-Token', login.body.csrfToken).expect(403);
      await agent.post(logoutPath).set('Origin', origin).set('X-CSRF-Token', 'a'.repeat(64)).expect(403);
      await agent.get(mePath).expect(200);
      const logout = await agent.post(logoutPath).set('Origin', origin).set('X-CSRF-Token', login.body.csrfToken).expect(204);
      expect((logout.headers['set-cookie'] as unknown as string[]).every(value => value.includes('Expires=Thu, 01 Jan 1970'))).toBe(true);
      expect((await test.db.session.findUniqueOrThrow({ where: { id: session.id } })).revokedAt).not.toBeNull();
      await agent.get(mePath).expect(401);
      await request(test.app.getHttpServer()).get(mePath).set('Cookie', cookies(login)).expect(401);
    } finally { await test.close(); }
  });

  it('recusa sessão ausente, aleatória ou expirada e cookie CSRF trocado', async () => {
    const test = await startTestApp();
    try {
      const admin = await seedTestAdmin(test.db);
      const server = test.app.getHttpServer();
      await request(server).get(mePath).expect(401);
      await request(server).get(mePath).set('Cookie', `forge_session=${'a'.repeat(64)}`).expect(401);
      await request(server).get(mePath).set('Cookie', 'forge_session=j:123').expect(401);
      const login = await request(server).post(loginPath).set('Origin', origin).send(admin).expect(200);
      await request(server).get(mePath).set('Cookie', [`forge_session=${token(login, 'forge_session')}`, `forge_csrf=${'b'.repeat(64)}`]).expect(403);
      await test.db.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1) } });
      await request(server).get(mePath).set('Cookie', cookies(login)).expect(401);
    } finally { await test.close(); }
  });

  it('não distingue email desconhecido de senha errada e não cria sessão em falhas', async () => {
    const test = await startTestApp();
    try {
      const admin = await seedTestAdmin(test.db);
      const server = test.app.getHttpServer();
      const wrong = await request(server).post(loginPath).set('Origin', origin).send({ ...admin, password: 'Senha incorreta 123!' }).expect(401);
      const unknown = await request(server).post(loginPath).set('Origin', origin).send({ ...admin, email: 'unknown@example.test' }).expect(401);
      expect(wrong.body.code).toBe(unknown.body.code);
      expect(wrong.body.message).toBe(unknown.body.message);
      expect(wrong.headers['set-cookie']).toBeUndefined();
      expect(await test.db.session.count()).toBe(0);
    } finally { await test.close(); }
  });

  it('valida Origin, formato estrito e tamanho do corpo antes de autenticar', async () => {
    const test = await startTestApp();
    try {
      const admin = await seedTestAdmin(test.db);
      const server = test.app.getHttpServer();
      await request(server).post(loginPath).send(admin).expect(403);
      await request(server).post(loginPath).set('Origin', 'https://evil.example').send(admin).expect(403);
      for (const data of [{ ...admin, role: 'admin' }, { email: 'bad', password: admin.password }, { ...admin, password: 'a'.repeat(129) }, { ...admin, password: 'short' }]) {
        await request(server).post(loginPath).set('Origin', origin).send(data).expect(400);
      }
      await request(server).post(loginPath).set('Origin', origin).send({ ...admin, password: 'x'.repeat(129 * 1024) }).expect(413);
      expect(await test.db.session.count()).toBe(0);
    } finally { await test.close(); }
  });

  it('bloqueia após cinco falhas, não confia em X-Forwarded-For e libera após quinze minutos', async () => {
    const test = await startTestApp();
    try {
      const admin = await seedTestAdmin(test.db);
      const now = Date.now();
      const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
      const server = test.app.getHttpServer();
      for (let i = 0; i < 5; i++) {
        await request(server).post(loginPath).set('Origin', origin).set('X-Forwarded-For', `10.0.0.${i}`).send({ ...admin, password: 'Senha incorreta!' }).expect(401);
      }
      await request(server).post(loginPath).set('Origin', origin).send({ ...admin, email: admin.email.toUpperCase() }).expect(429);
      clock.mockReturnValue(now + 15 * 60 * 1000);
      await request(server).post(loginPath).set('Origin', origin).send(admin).expect(200);
    } finally { await test.close(); }
  });
});

it('marca os dois cookies como Secure em produção', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  let test: Awaited<ReturnType<typeof startTestApp>> | undefined;
  try {
    test = await startTestApp();
    const admin = await seedTestAdmin(test.db);
    const login = await request(test.app.getHttpServer()).post(loginPath).set('Origin', origin).send(admin).expect(200);
    for (const cookie of login.headers['set-cookie'] as unknown as string[]) expect(cookie).toContain('; Secure');
  } finally {
    await test?.close();
    vi.unstubAllEnvs();
  }
});

it('gera tokens novos por login e recusa CSRF de outra sessão e ausência de Origin', async () => {
  const test = await startTestApp();
  try {
    const admin = await seedTestAdmin(test.db);
    const server = test.app.getHttpServer();
    const first = await request(server).post(loginPath).set('Origin', origin).send(admin).expect(200);
    const second = await request(server).post(loginPath).set('Origin', origin).send(admin).expect(200);
    expect(token(first, 'forge_session')).not.toBe(token(second, 'forge_session'));
    expect(first.body.csrfToken).not.toBe(second.body.csrfToken);
    await request(server).post(logoutPath).set('Cookie', cookies(first)).set('Origin', origin).set('X-CSRF-Token', second.body.csrfToken).expect(403);
    await request(server).post(logoutPath).set('Cookie', cookies(first)).set('X-CSRF-Token', first.body.csrfToken).expect(403);
    await request(server).get(mePath).set('Cookie', cookies(first)).expect(200);
  } finally { await test.close(); }
});
