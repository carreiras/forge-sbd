import { mkdtemp, readFile, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { saveRestClientCredentials } from './restclient-credentials.js';

it('serializa aspas e barras da senha sem modificar o valor e recusa credenciais inválidas', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'forge-restclient-'));
  const path = join(folder, 'login.local.json');
  try {
    const password = 'Senha"ficticia\\n123!';
    await saveRestClientCredentials(path, { email: ' Admin@example.test ', password });
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual({ email: 'admin@example.test', password });
    await expect(saveRestClientCredentials(path, { email: 'bad', password: 'short' })).rejects.toThrow();
    expect(JSON.parse(await readFile(path, 'utf8')).password).toBe(password);
  } finally { await rm(path, { force: true }); await rmdir(folder); }
});
