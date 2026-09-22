import '../src/environment.js';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { validateTestDatabaseUrl } from '../test/test-database.js';

const url = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [resolve(dirname(require.resolve('prisma/package.json')), 'build/index.js'), 'migrate', 'deploy'], {
  cwd: new URL('../', import.meta.url),
  env: { ...process.env, DATABASE_URL: url },
  stdio: 'inherit',
});
if (result.error) throw new Error('Não foi possível executar Prisma migrate deploy no banco de teste.');
process.exitCode = result.status ?? 1;
