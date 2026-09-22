import { AdminSetupError } from './admin-setup.error.js';
import { promptLine } from './terminal-prompt.js';
import { saveRestClientCredentials } from './restclient-credentials.js';

try {
  if (process.argv.length > 2) throw new AdminSetupError('Não informe credenciais como argumentos. Use os prompts do terminal.');
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new AdminSetupError('Execute em um terminal interativo.');
  console.info('Será criado restclient/login.local.json com suas credenciais locais. O arquivo é ignorado pelo Git; remova-o após testar.');
  const email = await promptLine('Email: ', false);
  const password = await promptLine('Senha (sem eco): ', true);
  await saveRestClientCredentials(new URL('../../../../restclient/login.local.json', import.meta.url), { email, password });
  console.info('Arquivo local preparado. Abra restclient/auth.http no REST Client.');
} catch (error) {
  const exists = typeof error === 'object' && error !== null && 'code' in error && error.code === 'EEXIST';
  console.error(error instanceof AdminSetupError ? error.message : exists
    ? 'login.local.json já existe. Para trocar as credenciais, remova esse arquivo local e execute novamente.'
    : 'Não foi possível preparar as credenciais locais. Verifique as permissões da pasta restclient.');
  process.exitCode = 1;
}
