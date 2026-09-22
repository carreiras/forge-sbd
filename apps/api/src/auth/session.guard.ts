import { Inject, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth-request.js';
import { PUBLIC_ROUTE } from './public.decorator.js';
import { sessionCookie } from './tokens.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector, @Inject(AuthService) private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const result = await this.auth.authenticate(request.cookies?.[sessionCookie]);
    request.user = result.user;
    request.authSession = result.session;
    return true;
  }
}
