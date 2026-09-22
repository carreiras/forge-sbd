import '../environment.js';
import { readConfig } from '../config.js';
import { DatabaseService } from '../database/database.service.js';
import { AdminSetupError } from './admin-setup.error.js';
import { createAdmin } from './create-admin.js';
import { promptAdminCredentials } from './terminal-prompt.js';

let db: DatabaseService | undefined;
try {
  if (process.argv.length > 2) throw new AdminSetupError('Não informe credenciais como argumentos. Use os prompts do terminal.');
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new AdminSetupError('Execute o bootstrap em um terminal interativo.');
  db = new DatabaseService(readConfig().databaseUrl);
  await db.$connect();
  if (await db.user.count() !== 0) throw new AdminSetupError('Um administrador já existe. Nenhuma alteração realizada.');
  const credentials = await promptAdminCredentials();
  await createAdmin(db, credentials);
  console.info('Administrador criado. Use o login da API para iniciar uma sessão.');
} catch (error) {
  console.error(error instanceof AdminSetupError ? error.message : 'Não foi possível criar o administrador. Verifique a configuração e o banco local.');
  process.exitCode = 1;
} finally {
  await db?.$disconnect();
}
