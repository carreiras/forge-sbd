import { createHash, timingSafeEqual } from 'node:crypto';

export const sessionCookie = 'forge_session';
export const csrfCookie = 'forge_csrf';
export const sessionDurationMs = 8 * 60 * 60 * 1000;
export const digest = (value: string): string => createHash('sha256').update(value).digest('hex');
export function isToken(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
}
export function matchesToken(value: unknown, hash: string): boolean {
  return isToken(value) && /^[a-f0-9]{64}$/.test(hash)
    && timingSafeEqual(Buffer.from(digest(value), 'hex'), Buffer.from(hash, 'hex'));
}
