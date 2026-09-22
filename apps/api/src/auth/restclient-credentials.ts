import { writeFile } from 'node:fs/promises';
import { AdminSetupError } from './admin-setup.error.js';
import { credentialsSchema } from './credentials.js';

export async function saveRestClientCredentials(path: string | URL, input: unknown): Promise<void> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) throw new AdminSetupError('Informe email válido e senha de 12 a 128 caracteres.');
  // Exclusive creation avoids overwriting an existing file or following a symlink.
  await writeFile(path, JSON.stringify(parsed.data, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}
