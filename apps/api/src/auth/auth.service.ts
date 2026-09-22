import { randomBytes } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service.js';
import type { LoginLimiter } from './login-limiter.js';
import { verifyPassword } from './password.js';
import { digest, isToken, sessionDurationMs } from './tokens.js';

export class AuthService {
  constructor(private readonly db: DatabaseService, private readonly limiter: LoginLimiter, private readonly dummyHash: string) {}

  async login(ip: string, email: string, password: string) {
    const finish = this.limiter.begin(ip, email);
    let success = false;
    try {
      const user = await this.db.user.findUnique({ where: { email } });
      const valid = await verifyPassword(password, user?.passwordHash ?? this.dummyHash);
      if (!user || !valid) throw new UnauthorizedException();
      const sessionToken = randomBytes(32).toString('hex');
      const csrfToken = randomBytes(32).toString('hex');
      await this.db.session.create({ data: {
        userId: user.id, tokenHash: digest(sessionToken), csrfHash: digest(csrfToken),
        expiresAt: new Date(Date.now() + sessionDurationMs),
      } });
      success = true;
      return { user: { id: user.id, email: user.email }, sessionToken, csrfToken };
    } finally { finish(success); }
  }

  async authenticate(value: unknown) {
    if (!isToken(value)) throw new UnauthorizedException();
    const session = await this.db.session.findUnique({
      where: { tokenHash: digest(value) }, include: { user: { select: { id: true, email: true } } },
    });
    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) throw new UnauthorizedException();
    return { user: session.user, session: { id: session.id, csrfHash: session.csrfHash } };
  }

  async logout(sessionId: string): Promise<void> {
    await this.db.session.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: new Date(Date.now()) } });
  }
}
