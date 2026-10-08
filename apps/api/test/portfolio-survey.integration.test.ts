import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { AuditService } from '../src/audit/audit.service.js';
import { PortfolioModule } from '../src/portfolio/portfolio.module.js';
import { SurveysModule } from '../src/surveys/surveys.module.js';
import { startTestApp, seedTestAdmin } from './support.js';

const origin = 'http://localhost:5173';
type TestApp = Awaited<ReturnType<typeof startTestApp>>;

const testAdmin = { email: 'admin@example.test', password: 'Senha ficticia 123!' };

async function login(test: TestApp, seed = true) {
  const admin = seed ? await seedTestAdmin(test.db) : testAdmin;
  const agent = request.agent(test.app.getHttpServer());
  const response = await agent.post('/api/v1/auth/login').set('Origin', origin).send(admin).expect(200);
  const csrfToken: string = response.body.csrfToken;
  const send = (method: 'post' | 'patch', path: string, body: unknown) =>
    agent[method](path).set('Origin', origin).set('X-CSRF-Token', csrfToken).send(body as object);
  return { agent, csrfToken, send, userId: response.body.user.id as string };
}

const projectInput = { name: 'API demo', description: 'Fictícia', owner: 'Operador', domains: ['api'] };

async function createProject(send: Awaited<ReturnType<typeof login>>['send'], domains: string[] = ['api']) {
  const app = await send('post', '/api/v1/applications', { name: 'Demo', description: '' }).expect(201);
  const project = await send('post', `/api/v1/applications/${app.body.id}/projects`, { ...projectInput, domains }).expect(201);
  return { applicationId: app.body.id as string, project: project.body };
}

afterEach(() => vi.restoreAllMocks());
describe('portfólio e rascunho do questionário', () => {
  it('cadastra aplicação e projeto, salva rascunho com revisão e retoma', async () => {
    const test = await startTestApp();
    try {
      const { agent, send, userId } = await login(test);
      const appResult = await send('post', '/api/v1/applications', { name: '  Demo  ', description: '' }).expect(201);
      expect(appResult.body).toEqual({ id: expect.any(String), name: 'Demo', description: '', createdAt: expect.any(String) });
      const project = await send('post', `/api/v1/applications/${appResult.body.id}/projects`,
        { name: ' API demo ', description: 'Fictícia', owner: ' Operador ', domains: ['api'] }).expect(201);
      expect(project.body).toEqual({
        id: expect.any(String), applicationId: appResult.body.id, name: 'API demo', description: 'Fictícia',
        owner: 'Operador', domains: ['api'], revision: 0, createdAt: expect.any(String),
      });
      expect((await agent.get(`/api/v1/projects/${project.body.id}`).expect(200)).body).toEqual(project.body);
      expect((await agent.get(`/api/v1/applications/${appResult.body.id}/projects`).expect(200)).body)
        .toEqual({ items: [project.body], nextOffset: null });

      const route = `/api/v1/projects/${project.body.id}/survey`;
      expect((await agent.get(route).expect(200)).body)
        .toEqual({ questionnaireVersion: 'survey-1', revision: 0, answers: {}, needsConfirmationIds: [] });
      const saved = await send('patch', route, { revision: 0, answers: { q14: { state: 'unknown' } }, confirmedIds: [] }).expect(200);
      expect(saved.body).toEqual({ questionnaireVersion: 'survey-1', revision: 1, answers: { q14: { state: 'unknown' } }, needsConfirmationIds: [] });
      const conflict = await send('patch', route, { revision: 0, answers: {}, confirmedIds: [] }).expect(409);
      expect(conflict.body).toEqual({ code: 'REVISION_CONFLICT', message: 'O questionário foi alterado. Recarregue antes de salvar.', requestId: expect.any(String) });
      // Only keys present in the patch are replaced.
      await send('patch', route, { revision: 1, answers: { q01: { state: 'known', value: 'dev' } }, confirmedIds: [] }).expect(200);
      const resumed = await agent.get(route).expect(200);
      expect(resumed.body.answers).toEqual({ q14: { state: 'unknown' }, q01: { state: 'known', value: 'dev' } });
      expect(resumed.body.revision).toBe(2);

      const events = await test.db.auditEvent.findMany({ orderBy: { createdAt: 'asc' } });
      expect(events.map(e => [e.action, e.targetId, e.actorId])).toEqual([
        ['application.create', appResult.body.id, userId],
        ['project.create', project.body.id, userId],
        ['survey.update', project.body.id, userId],
        ['survey.update', project.body.id, userId],
      ]);
      expect(events.every(e => e.requestId.length === 36)).toBe(true);
    } finally { await test.close(); }
  });

  it('mantém o rascunho após encerrar e iniciar outra instância no mesmo banco', async () => {
    const test = await startTestApp();
    try {
      const { send } = await login(test);
      const { project } = await createProject(send);
      const route = `/api/v1/projects/${project.id}/survey`;
      await send('patch', route, { revision: 0, answers: { q14: { state: 'known', value: true }, q09: { state: 'known', value: ['js_ts', 'go'] } }, confirmedIds: [] }).expect(200);
      await test.restart();
      // Same database, new process state: the admin persists, so only log in again.
      const { agent } = await login(test, false);
      const resumed = await agent.get(route).expect(200);
      expect(resumed.body).toEqual({ questionnaireVersion: 'survey-1', revision: 1,
        answers: { q14: { state: 'known', value: true }, q09: { state: 'known', value: ['js_ts', 'go'] } }, needsConfirmationIds: [] });
      expect((await agent.get(`/api/v1/projects/${project.id}`).expect(200)).body).toEqual(project);
    } finally { await test.close(); }
  });

  it('atualiza projeto com revisão e pede confirmação de respostas que reaparecem', async () => {
    const test = await startTestApp();
    try {
      const { agent, send } = await login(test);
      const { project } = await createProject(send, ['api', 'cloud']);
      const projectRoute = `/api/v1/projects/${project.id}`;
      const route = `${projectRoute}/survey`;
      await send('patch', route, { revision: 0, confirmedIds: [], answers: {
        q14: { state: 'known', value: true }, q19: { state: 'known', value: true }, q20: { state: 'known', value: true },
      } }).expect(200);

      const updated = await send('patch', projectRoute, { revision: 0, name: 'Novo nome', description: '', owner: 'Outra pessoa', domains: ['cloud'] }).expect(200);
      expect(updated.body).toMatchObject({ name: 'Novo nome', owner: 'Outra pessoa', domains: ['cloud'], revision: 1 });
      const stale = await send('patch', projectRoute, { revision: 0, ...projectInput }).expect(409);
      expect(stale.body.code).toBe('REVISION_CONFLICT');
      // Domain change alters the draft context, so its revision advances; inactive answers stay stored.
      let draft = (await agent.get(route).expect(200)).body;
      expect(draft).toMatchObject({ revision: 2, needsConfirmationIds: [] });
      expect(draft.answers.q14).toEqual({ state: 'known', value: true });

      await send('patch', projectRoute, { revision: 1, ...projectInput, domains: ['api', 'cloud'] }).expect(200);
      draft = (await agent.get(route).expect(200)).body;
      expect(draft).toMatchObject({ revision: 3, needsConfirmationIds: ['q14'] });

      // Answer-driven deactivation and reactivation of q20.
      draft = (await send('patch', route, { revision: 3, answers: { q19: { state: 'known', value: false } }, confirmedIds: [] }).expect(200)).body;
      expect(draft.needsConfirmationIds).toEqual(['q14']);
      draft = (await send('patch', route, { revision: 4, answers: { q19: { state: 'known', value: true } }, confirmedIds: [] }).expect(200)).body;
      expect(draft.needsConfirmationIds).toEqual(['q14', 'q20']);
      // Confirming or answering again clears the pending confirmation.
      draft = (await send('patch', route, { revision: 5, answers: { q20: { state: 'known', value: false } }, confirmedIds: ['q14'] }).expect(200)).body;
      expect(draft).toMatchObject({ revision: 6, needsConfirmationIds: [], answers: { q20: { state: 'known', value: false } } });
      expect(await test.db.auditEvent.count({ where: { action: 'project.update' } })).toBe(2);
    } finally { await test.close(); }
  });

  it('lista aplicações com paginação e expõe o questionário atual', async () => {
    const test = await startTestApp();
    try {
      const { agent, send } = await login(test);
      const ids: string[] = [];
      for (const name of ['A', 'B', 'C']) ids.push((await send('post', '/api/v1/applications', { name, description: '' }).expect(201)).body.id);
      const first = await agent.get('/api/v1/applications?limit=2').expect(200);
      expect(first.body.items.map((a: { id: string }) => a.id)).toEqual(ids.slice(0, 2));
      expect(first.body.nextOffset).toBe(2);
      const second = await agent.get('/api/v1/applications?limit=2&offset=2').expect(200);
      expect(second.body).toEqual({ items: [expect.objectContaining({ id: ids[2], name: 'C' })], nextOffset: null });
      await agent.get('/api/v1/applications?limit=101').expect(400);
      await agent.get('/api/v1/applications?limit=0').expect(400);
      await agent.get('/api/v1/applications?offset=-1').expect(400);
      await agent.get('/api/v1/applications?extra=1').expect(400);

      const survey = await agent.get('/api/v1/questionnaires/current').expect(200);
      expect(survey.body.version).toBe('survey-1');
      expect(survey.body.questions).toHaveLength(24);
      expect(survey.body.questions[0]).toMatchObject({ id: 'q01', kind: 'single', options: ['dev', 'staging', 'prod'] });
    } finally { await test.close(); }
  });

  it('exige sessão e CSRF nas rotas de portfólio e questionário', async () => {
    const test = await startTestApp();
    try {
      const server = test.app.getHttpServer();
      await request(server).get('/api/v1/applications').expect(401);
      await request(server).get('/api/v1/questionnaires/current').expect(401);
      const { agent } = await login(test);
      await agent.post('/api/v1/applications').set('Origin', origin).send({ name: 'Demo', description: '' }).expect(403);
      expect(await test.db.application.count()).toBe(0);
    } finally { await test.close(); }
  });

  it('recusa identificadores, cadastros e respostas inválidos sem alterar dados', async () => {
    const test = await startTestApp();
    try {
      const { agent, send } = await login(test);
      const { applicationId, project } = await createProject(send);
      const missing = '3f9b6c1e-2d4a-4e8b-9c7d-1a2b3c4d5e6f';
      await agent.get('/api/v1/projects/nao-uuid').expect(400);
      await agent.get('/api/v1/applications/nao-uuid/projects').expect(400);
      await agent.get(`/api/v1/applications/${missing}/projects`).expect(404);
      await send('post', `/api/v1/applications/${missing}/projects`, projectInput).expect(404);
      await agent.get(`/api/v1/projects/${missing}`).expect(404);
      await agent.get(`/api/v1/projects/${missing}/survey`).expect(404);
      await send('patch', `/api/v1/projects/${missing}/survey`, { revision: 0, answers: {}, confirmedIds: [] }).expect(404);
      await send('patch', `/api/v1/projects/${missing}`, { revision: 0, ...projectInput }).expect(404);

      for (const body of [
        { name: '   ', description: '' }, { name: 'x'.repeat(121), description: '' },
        { name: 'Ok', description: 'x'.repeat(2001) }, { name: 'Ok' }, { name: 'Ok', description: '', extra: true },
      ]) await send('post', '/api/v1/applications', body).expect(400);
      const projects = `/api/v1/applications/${applicationId}/projects`;
      for (const body of [
        { ...projectInput, domains: [] }, { ...projectInput, domains: ['desktop'] }, { ...projectInput, domains: ['api', 'api'] },
        { ...projectInput, owner: 'x'.repeat(161) }, { ...projectInput, owner: ' ' }, { ...projectInput, revision: 0 },
      ]) await send('post', projects, body).expect(400);
      await send('patch', `/api/v1/projects/${project.id}`, projectInput).expect(400);
      await send('patch', `/api/v1/projects/${project.id}`, { revision: -1, ...projectInput }).expect(400);

      const route = `/api/v1/projects/${project.id}/survey`;
      for (const body of [
        { answers: {}, confirmedIds: [] }, { revision: 1.5, answers: {}, confirmedIds: [] },
        { revision: 0, answers: { q14: { state: 'maybe' } }, confirmedIds: [] },
        { revision: 0, answers: { q14: { state: 'unknown', value: true } }, confirmedIds: [] },
        { revision: 0, answers: {}, confirmedIds: [], extra: 1 },
      ]) await send('patch', route, body).expect(400);
      for (const body of [
        { revision: 0, answers: { q99: { state: 'unknown' } }, confirmedIds: [] },
        { revision: 0, answers: { q01: { state: 'known', value: 'qa' } }, confirmedIds: [] },
        { revision: 0, answers: { q14: { state: 'known', value: 'sim' } }, confirmedIds: [] },
        { revision: 0, answers: { q09: { state: 'known', value: ['js_ts', 'cobol'] } }, confirmedIds: [] },
        { revision: 0, answers: {}, confirmedIds: ['q99'] },
      ]) {
        const response = await send('patch', route, body).expect(422);
        expect(response.body).toEqual({ code: 'UNPROCESSABLE_ENTITY', message: 'Dados inválidos para esta operação.', requestId: expect.any(String) });
      }
      expect(await test.db.application.count()).toBe(1);
      expect(await test.db.project.count()).toBe(1);
      expect((await agent.get(route).expect(200)).body.revision).toBe(0);
      expect(await test.db.auditEvent.count()).toBe(2);
    } finally { await test.close(); }
  });

  it('aceita somente um de dois salvamentos concorrentes com a mesma revisão', async () => {
    const test = await startTestApp();
    try {
      const { send } = await login(test);
      const { project } = await createProject(send);
      const route = `/api/v1/projects/${project.id}/survey`;
      const responses = await Promise.all([true, false].map(value =>
        send('patch', route, { revision: 0, answers: { q14: { state: 'known', value } }, confirmedIds: [] })));
      expect(responses.map(r => r.status).sort()).toEqual([200, 409]);
      const winner = responses.find(r => r.status === 200)!;
      const draft = await test.db.surveyDraft.findUniqueOrThrow({ where: { projectId: project.id } });
      expect(draft.revision).toBe(1);
      expect(draft.answers).toEqual(winner.body.answers);
      expect(await test.db.auditEvent.count({ where: { action: 'survey.update' } })).toBe(1);
    } finally { await test.close(); }
  });

  it('desfaz cadastro e rascunho quando a auditoria falha na mesma transação', async () => {
    const test = await startTestApp();
    try {
      const { send } = await login(test);
      const { applicationId, project } = await createProject(send);
      const failure = () => Promise.reject(new Error('falha simulada de auditoria'));
      vi.spyOn(test.app.select(PortfolioModule).get(AuditService, { strict: true }), 'record').mockImplementation(failure);
      vi.spyOn(test.app.select(SurveysModule).get(AuditService, { strict: true }), 'record').mockImplementation(failure);
      const error = await send('post', '/api/v1/applications', { name: 'Outra', description: '' }).expect(500);
      expect(error.body).toEqual({ code: 'INTERNAL_ERROR', message: 'Erro interno.', requestId: expect.any(String) });
      expect(JSON.stringify(error.body)).not.toContain('falha simulada');
      await send('post', `/api/v1/applications/${applicationId}/projects`, projectInput).expect(500);
      await send('patch', `/api/v1/projects/${project.id}`, { revision: 0, ...projectInput, domains: ['web'] }).expect(500);
      await send('patch', `/api/v1/projects/${project.id}/survey`, { revision: 0, answers: { q14: { state: 'unknown' } }, confirmedIds: [] }).expect(500);
      expect(await test.db.application.count()).toBe(1);
      expect(await test.db.project.findMany()).toEqual([expect.objectContaining({ id: project.id, revision: 0, domains: ['api'] })]);
      expect(await test.db.surveyDraft.findMany()).toEqual([expect.objectContaining({ projectId: project.id, revision: 0, answers: {} })]);
    } finally { await test.close(); }
  });
});
