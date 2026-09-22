import '../src/environment.js';
import pg from 'pg';
import type { INestApplication } from '@nestjs/common';
import { createApp } from '../src/create-app.js';
import type { DatabaseService } from '../src/database/database.service.js';
import { DatabaseService as DatabaseToken } from '../src/database/database.service.js';
import { validateTestDatabaseUrl } from './test-database.js';

async function clean(db: DatabaseService): Promise<void> {
  await db.$transaction([
    db.requirement.deleteMany(), db.assessment.deleteMany(), db.surveyDraft.deleteMany(),
    db.project.deleteMany(), db.application.deleteMany(), db.auditEvent.deleteMany(),
    db.session.deleteMany(), db.user.deleteMany(),
  ]);
}

export async function startTestApp(): Promise<{
  app: INestApplication; db: DatabaseService; close(): Promise<void>;
}> {
  const url = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const lock = new pg.Client({ connectionString: url, connectionTimeoutMillis: 5_000, query_timeout: 10_000 });
  let app: INestApplication | undefined;
  try {
    await lock.connect();
    const result = await lock.query<{ name: string }>('SELECT current_database() AS name');
    if (result.rows[0]?.name !== decodeURIComponent(new URL(url).pathname.slice(1))) {
      throw new Error('Banco de teste não corresponde à configuração.');
    }
    // Serialize even separate Vitest processes before any test-data cleanup.
    await lock.query('SELECT pg_advisory_lock(1783952041)');
    app = await createApp({ ...process.env, DATABASE_URL: url });
    const db = app.get(DatabaseToken);
    await clean(db);
    const runningApp = app;
    let closed = false;
    return {
      app: runningApp, db,
      async close() {
        if (closed) return;
        closed = true;
        try { await clean(db); }
        finally {
          try { await runningApp.close(); }
          finally { await lock.end(); }
        }
      },
    };
  } catch {
    try { await app?.close(); }
    finally { await lock.end(); }
    throw new Error('Falha ao preparar PostgreSQL de teste. Verifique TEST_DATABASE_URL, Docker e migrations; nenhum teste foi ignorado.');
  }
}

export async function seedTestAdmin(db: DatabaseService): Promise<{ email: string; password: string }> {
  const rows = await db.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
  if (!rows[0]?.name.endsWith('_test')) throw new Error('seedTestAdmin exige banco dedicado _test.');
  const { hashPassword } = await import('../src/auth/password.js');
  const credentials = { email: 'admin@example.test', password: 'Senha ficticia 123!' };
  await db.user.create({ data: { email: credentials.email, passwordHash: await hashPassword(credentials.password) } });
  return credentials;
}
