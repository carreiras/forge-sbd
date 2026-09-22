import type { DatabaseService } from '../database/database.service.js';
import { AdminSetupError } from './admin-setup.error.js';
import { credentialsSchema } from './credentials.js';
import { hashPassword } from './password.js';

export async function createAdmin(db: DatabaseService, input: unknown): Promise<{ id: string; email: string }> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) throw new AdminSetupError('Informe email válido e senha de 12 a 128 caracteres.');
  const passwordHash = await hashPassword(parsed.data.password);
  return db.$transaction(async tx => {
    // A transaction-scoped lock serializes bootstraps, including different emails.
    await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(1783952042)`;
    if (await tx.user.count() !== 0) throw new AdminSetupError('Um administrador já existe. Nenhuma alteração realizada.');
    return tx.user.create({ data: { email: parsed.data.email, passwordHash }, select: { id: true, email: true } });
  });
}
