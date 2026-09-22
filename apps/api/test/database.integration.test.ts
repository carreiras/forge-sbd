import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { startTestApp } from './support.js';
import { AuditService } from '../src/audit/audit.service.js';

describe('persistência PostgreSQL e API REST', () => {
  it('expõe saúde e persiste a aplicação em uma nova conexão', async () => {
    const test = await startTestApp();
    try {
      const response = await request(test.app.getHttpServer()).get('/api/v1/health').expect(200);
      expect(response.body).toEqual({ status: 'ok' });
      const application = await test.db.application.create({ data: { name: 'App fictícia', description: '' } });
      await test.db.$disconnect();
      await test.db.$connect();
      expect(await test.db.application.findUnique({ where: { id: application.id } }))
        .toMatchObject({ name: 'App fictícia', description: '' });
    } finally { await test.close(); }
  });

  it('preserva histórico com FKs e impede duplicar avaliação ou requisito', async () => {
    const test = await startTestApp();
    try {
      const application = await test.db.application.create({ data: { name: 'Demo', description: '' } });
      const project = await test.db.project.create({ data: {
        applicationId: application.id, name: 'API', description: '', owner: 'Operador', domains: ['api'],
      } });
      expect(project.revision).toBe(0);
      const data = { projectId: project.id, fingerprint: 'a'.repeat(64), context: {}, catalogSnapshot: {}, decisions: [] };
      const assessment = await test.db.assessment.create({ data });
      await expect(test.db.assessment.create({ data })).rejects.toMatchObject({ code: 'P2002' });
      const requirement = { assessmentId: assessment.id, controlId: 'DEMO-001', controlSnapshot: {}, applicability: 'applicable' as const };
      await test.db.requirement.create({ data: requirement });
      await expect(test.db.requirement.create({ data: requirement })).rejects.toMatchObject({ code: 'P2002' });
      await expect(test.db.project.delete({ where: { id: project.id } })).rejects.toMatchObject({ code: 'P2003' });
      await expect(test.db.assessment.delete({ where: { id: assessment.id } })).rejects.toMatchObject({ code: 'P2003' });
      const changed = await test.db.assessment.create({ data: { ...data, fingerprint: 'b'.repeat(64) } });
      expect(changed.id).not.toBe(assessment.id);
      expect(await test.db.assessment.count({ where: { projectId: project.id } })).toBe(2);
      await expect(test.db.project.create({ data: {
        applicationId: randomUUID(), name: 'Órfão', description: '', owner: 'Operador', domains: ['api'],
      } })).rejects.toMatchObject({ code: 'P2003' });
    } finally { await test.close(); }
  });

  it('grava auditoria na mesma transação e desfaz ambos em falha', async () => {
    const test = await startTestApp();
    try {
      const actor = await test.db.user.create({ data: { email: 'operator@example.test', passwordHash: 'fixture-not-a-password' } });
      const audit = test.app.get(AuditService);
      const requestId = randomUUID();
      await expect(test.db.$transaction(async tx => {
        const application = await tx.application.create({ data: { name: 'Rollback', description: '' } });
        await audit.record(tx, { actorId: actor.id, action: 'application.created', targetId: application.id, requestId });
        throw new Error('rollback esperado');
      })).rejects.toThrow('rollback esperado');
      expect(await test.db.application.count()).toBe(0);
      expect(await test.db.auditEvent.count()).toBe(0);
      await test.db.$transaction(async tx => {
        const application = await tx.application.create({ data: { name: 'Commit', description: '' } });
        await audit.record(tx, { actorId: actor.id, action: 'application.created', targetId: application.id, requestId });
      });
      expect(await test.db.auditEvent.findMany()).toEqual([
        expect.objectContaining({ actorId: actor.id, action: 'application.created', requestId }),
      ]);
    } finally { await test.close(); }
  });
});
