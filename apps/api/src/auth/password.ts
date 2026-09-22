import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const prefix = 'scrypt$32768$8$1$';
const format = /^scrypt\$32768\$8\$1\$([a-f0-9]{32})\$([a-f0-9]{128})$/;
function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error); else resolve(key);
    });
  });
}
export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 128) throw new Error('A senha deve ter de 12 a 128 caracteres.');
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `${prefix}${salt.toString('hex')}$${key.toString('hex')}`;
}
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const match = format.exec(encoded);
  if (!match || password.length < 12 || password.length > 128) return false;
  const actual = await derive(password, Buffer.from(match[1]!, 'hex'));
  return timingSafeEqual(actual, Buffer.from(match[2]!, 'hex'));
}
