import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const API_CONFIG = Symbol('API_CONFIG');
export type ApiConfig = { databaseUrl: string; port: number; webOrigin: string; secureCookies: boolean; contentDirectory: string };

// src/config.ts and dist/config.js share the same depth below the repository root.
const repositoryContent = fileURLToPath(new URL('../../../content', import.meta.url));

export function readConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const databaseUrl = env.DATABASE_URL ?? '';
  try {
    const url = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length <= 1) throw new Error();
  } catch { throw new Error('DATABASE_URL deve apontar para um banco PostgreSQL válido.'); }
  const rawPort = env.API_PORT ?? '3000';
  const port = Number(rawPort);
  if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT deve ser uma porta entre 1 e 65535.');
  }
  const webOrigin = env.WEB_ORIGIN ?? 'http://localhost:5173';
  try {
    const url = new URL(webOrigin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== webOrigin) throw new Error();
  } catch { throw new Error('WEB_ORIGIN deve ser uma origem HTTP(S) sem caminho ou credenciais.'); }
  const rawContent = env.CONTENT_DIRECTORY;
  if (rawContent !== undefined && !rawContent.trim()) throw new Error('CONTENT_DIRECTORY deve indicar a pasta de conteúdo versionado.');
  const contentDirectory = rawContent === undefined ? repositoryContent : resolve(rawContent);
  return { databaseUrl, port, webOrigin, secureCookies: env.NODE_ENV === 'production', contentDirectory };
}
