import { expect, it } from 'vitest';
import request from 'supertest';
import { startTestApp } from './support.js';

it('retorna erro estruturado e requestId sem refletir detalhes da requisição', async () => {
  const test = await startTestApp();
  try {
    const response = await request(test.app.getHttpServer()).get('/api/v1/missing?secret=hidden').expect(404);
    expect(response.body).toEqual({ code: 'NOT_FOUND', message: 'Recurso não encontrado.', requestId: expect.any(String) });
    expect(response.headers['x-request-id']).toBe(response.body.requestId);
    expect(response.body.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    const oversized = await request(test.app.getHttpServer()).post('/api/v1/missing').send({ data: 'x'.repeat(129 * 1024) }).expect(413);
    expect(oversized.body).toMatchObject({ code: 'PAYLOAD_TOO_LARGE', requestId: expect.any(String) });
    const invalid = await request(test.app.getHttpServer()).post('/api/v1/missing').set('Content-Type', 'application/json').send('{bad-json').expect(400);
    expect(invalid.body).toMatchObject({ code: 'BAD_REQUEST', requestId: expect.any(String) });
  } finally { await test.close(); }
});
