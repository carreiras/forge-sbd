import { UnauthorizedException } from '@nestjs/common';
import type { AuthRequest } from './auth-request.js';

export function actorOf(request: AuthRequest): { actorId: string; requestId: string } {
  if (!request.user) throw new UnauthorizedException();
  return { actorId: request.user.id, requestId: request.requestId };
}
