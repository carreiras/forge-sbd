import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_CONFIG } from '../config.js';
import type { ApiConfig } from '../config.js';
import type { AuthRequest } from './auth-request.js';
import { PUBLIC_ROUTE } from './public.decorator.js';
import { csrfCookie, matchesToken } from './tokens.js';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig, @Inject(Reflector) private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;
    if (request.headers.origin !== this.config.webOrigin) throw new ForbiddenException();
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const hash = request.authSession?.csrfHash;
    if (!hash || !matchesToken(request.headers['x-csrf-token'], hash) || !matchesToken(request.cookies?.[csrfCookie], hash)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
