import { describe, expect, it } from 'vitest';
import { readConfig } from '../src/config.js';
import { validateTestDatabaseUrl } from './test-database.js';

const valid = { DATABASE_URL: 'postgresql://forge:secret@127.0.0.1:5438/forge_sbd', WEB_ORIGIN: 'http://localhost:5173' };

describe('configuração validada antes da conexão', () => {
  it('valida a configuração sem incluir credenciais no erro', () => {
    expect(readConfig(valid)).toMatchObject({ port: 3000, webOrigin: 'http://localhost:5173' });
    for (const value of ['', 'https://forge:secret@host/db', 'postgresql://host/']) {
      expect(() => readConfig({ ...valid, DATABASE_URL: value })).toThrow('DATABASE_URL');
    }
    expect(() => readConfig({ ...valid, API_PORT: '3000oops' })).toThrow('API_PORT');
    expect(() => readConfig({ ...valid, API_PORT: '65536' })).toThrow('API_PORT');
    expect(() => readConfig({ ...valid, WEB_ORIGIN: 'http://localhost:5173/path' })).toThrow('WEB_ORIGIN');
    expect(() => readConfig({ ...valid, WEB_ORIGIN: 'http://user:secret@localhost:5173' })).toThrow('WEB_ORIGIN');
    try { readConfig({ ...valid, DATABASE_URL: 'bad-secret' }); }
    catch (error) { expect(String(error)).not.toContain('bad-secret'); }
  });
});

describe('isolamento do banco de teste', () => {
  it('recusa banco ausente, remoto, não-test e alias do banco principal antes de limpar', () => {
    const safe = 'postgresql://forge:secret@127.0.0.1:5438/forge_sbd_test';
    expect(validateTestDatabaseUrl(safe, valid.DATABASE_URL)).toBe(safe);
    for (const url of [undefined, valid.DATABASE_URL, 'postgresql://host/forge_test', 'postgresql://localhost/forge_test?schema=public', 'postgresql://localhost/forge_test?options=-csearch_path%3Dpublic']) {
      expect(() => validateTestDatabaseUrl(url, valid.DATABASE_URL)).toThrow('TEST_DATABASE_URL');
    }
    expect(() => validateTestDatabaseUrl(safe, 'postgresql://other:password@localhost:5438/forge_sbd_test')).toThrow('TEST_DATABASE_URL');
  });
});
