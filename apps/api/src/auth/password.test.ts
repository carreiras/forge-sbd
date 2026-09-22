import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('senha scrypt', () => {
  it('usa sal individual, verifica a senha correta e recusa senha diferente', async () => {
    const password = 'Senha ficticia 123!';
    const a = await hashPassword(password);
    const b = await hashPassword(password);
    expect(a).not.toBe(b);
    expect(a).toMatch(/^scrypt\$32768\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    expect(await verifyPassword(password, a)).toBe(true);
    expect(await verifyPassword('Senha incorreta!', a)).toBe(false);
  });
  it('recusa hashes malformados e parâmetros não permitidos', async () => {
    for (const hash of ['', 'scrypt$1$8$1$aa$bb', `scrypt$32768$8$1$${'a'.repeat(32)}$${'z'.repeat(128)}`, `scrypt$32768$8$1$${'a'.repeat(32)}$${'b'.repeat(128)}$extra`]) {
      expect(await verifyPassword('Senha ficticia 123!', hash)).toBe(false);
    }
  });
  it('limita a senha a 12–128 caracteres sem remover espaços', async () => {
    await expect(hashPassword('a'.repeat(11))).rejects.toThrow();
    await expect(hashPassword('a'.repeat(129))).rejects.toThrow();
    const hash = await hashPassword('  senha longa  ');
    expect(await verifyPassword('senha longa', hash)).toBe(false);
    expect(await verifyPassword('  senha longa  ', hash)).toBe(true);
  });
});
