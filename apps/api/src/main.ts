import './environment.js';
import { createApp } from './create-app.js';
import { readConfig } from './config.js';

try {
  const { port } = readConfig();
  const app = await createApp();
  app.enableShutdownHooks();
  try {
    await app.listen(port, '127.0.0.1');
    console.info(`ForgeSBD API: http://127.0.0.1:${port}/api/v1`);
  } catch (error) {
    await app.close();
    throw error;
  }
} catch {
  console.error('Não foi possível iniciar a API. Verifique a configuração, a porta e o PostgreSQL local.');
  process.exitCode = 1;
}
