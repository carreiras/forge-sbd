import { BadRequestException, Body, Controller, ForbiddenException, Get, Header, HttpCode, Inject, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { API_CONFIG } from '../config.js';
import type { ApiConfig } from '../config.js';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth-request.js';
import { credentialsSchema } from './credentials.js';
import { Public } from './public.decorator.js';
import { csrfCookie, matchesToken, sessionCookie, sessionDurationMs } from './tokens.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService, @Inject(API_CONFIG) private readonly config: ApiConfig) {}
  private cookieOptions(): CookieOptions {
    return { httpOnly: true, sameSite: 'lax', path: '/', secure: this.config.secureCookies };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async login(@Body() body: unknown, @Req() request: AuthRequest, @Res({ passthrough: true }) response: Response) {
    const parsed = credentialsSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException();
    const result = await this.auth.login(request.ip ?? request.socket.remoteAddress ?? 'local', parsed.data.email, parsed.data.password);
    const options = { ...this.cookieOptions(), maxAge: sessionDurationMs };
    response.cookie(sessionCookie, result.sessionToken, options);
    response.cookie(csrfCookie, result.csrfToken, options);
    return { user: result.user, csrfToken: result.csrfToken };
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@Req() request: AuthRequest) {
    if (!request.user || !request.authSession) throw new UnauthorizedException();
    const csrfToken: unknown = request.cookies?.[csrfCookie];
    if (!matchesToken(csrfToken, request.authSession.csrfHash)) throw new ForbiddenException();
    return { user: request.user, csrfToken };
  }

  @Post('logout')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  async logout(@Req() request: AuthRequest, @Res({ passthrough: true }) response: Response): Promise<void> {
    if (!request.authSession) throw new UnauthorizedException();
    await this.auth.logout(request.authSession.id);
    response.clearCookie(sessionCookie, this.cookieOptions());
    response.clearCookie(csrfCookie, this.cookieOptions());
  }
}
