import { describe, expect, it } from 'vitest';
import { startTestApp } from './support.js';
import { createAdmin } from '../src/auth/create-admin.js';
import { verifyPassword } from '../src/auth/password.js';

describe('bootstrap do administrador', () => {
  it('cria um administrador normalizado sem senha em claro e recusa uma segunda criação', async () => {
    const test = await startTestApp();
    try {
      const admin = await createAdmin(test.db, { email: ' Admin@Example.test ', password: 'Senha ficticia 123!' });
      expect(admin).toEqual({ id: expect.any(String), email: 'admin@example.test' });
      const saved = await test.db.user.findUniqueOrThrow({ where: { id: admin.id } });
      expect(saved.passwordHash).not.toBe('Senha ficticia 123!');
      expect(await verifyPassword('Senha ficticia 123!', saved.passwordHash)).toBe(true);
      await expect(createAdmin(test.db, { email: 'another@example.test', password: 'Outra senha 123!' })).rejects.toThrow('já existe');
      expect(await test.db.user.count()).toBe(1);
    } finally { await test.close(); }
  });
  it('serializa bootstraps concorrentes com emails distintos', async () => {
    const test = await startTestApp();
    try {
      const results = await Promise.allSettled([
        createAdmin(test.db, { email: 'first@example.test', password: 'Senha ficticia 123!' }),
        createAdmin(test.db, { email: 'second@example.test', password: 'Senha ficticia 456!' }),
      ]);
      expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
      expect(await test.db.user.count()).toBe(1);
    } finally { await test.close(); }
  });
  it('rejeita credenciais inválidas antes de criar o administrador', async () => {
    const test = await startTestApp();
    try {
      await expect(createAdmin(test.db, { email: 'bad', password: 'short' })).rejects.toThrow();
      expect(await test.db.user.count()).toBe(0);
    } finally { await test.close(); }
  });
});
