import { createHash } from 'node:crypto';
import { HttpException, Injectable } from '@nestjs/common';

type Window = { failures: number; inFlight: number; expiresAt: number };
@Injectable()
export class LoginLimiter {
  private readonly windows = new Map<string, Window>();
  private nextCleanup = 0;

  begin(ip: string, normalizedEmail: string): (success: boolean) => void {
    const now = Date.now();
    if (now >= this.nextCleanup || this.windows.size >= 10_000) {
      for (const [key, entry] of this.windows) {
        if (entry.expiresAt <= now && entry.inFlight === 0) this.windows.delete(key);
      }
      this.nextCleanup = now + 60_000;
    }
    const key = createHash('sha256').update(JSON.stringify([ip, normalizedEmail])).digest('hex');
    let entry = this.windows.get(key);
    if (entry && entry.expiresAt <= now && entry.inFlight === 0) {
      this.windows.delete(key);
      entry = undefined;
    }
    if (!entry) {
      if (this.windows.size >= 10_000) throw new HttpException('Muitas tentativas.', 429);
      entry = { failures: 0, inFlight: 0, expiresAt: now + 15 * 60_000 };
      this.windows.set(key, entry);
    }
    if (entry.failures + entry.inFlight >= 5) throw new HttpException('Muitas tentativas.', 429);
    entry.inFlight++;
    let finished = false;
    return success => {
      if (finished) return;
      finished = true;
      entry.inFlight--;
      entry.failures = success ? 0 : entry.failures + 1;
      if (entry.failures === 0 && entry.inFlight === 0) this.windows.delete(key);
    };
  }
}
