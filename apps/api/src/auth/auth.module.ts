import { randomBytes } from 'node:crypto';
import { Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { API_CONFIG } from '../config.js';
import type { ApiConfig } from '../config.js';
import { DatabaseService } from '../database/database.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { CsrfGuard } from './csrf.guard.js';
import { LoginLimiter } from './login-limiter.js';
import { hashPassword } from './password.js';
import { SessionGuard } from './session.guard.js';

@Module({})
export class AuthModule {
  static register(config: ApiConfig): DynamicModule {
    return {
      module: AuthModule,
      controllers: [AuthController],
      providers: [
        { provide: API_CONFIG, useValue: config },
        LoginLimiter,
        { provide: AuthService, inject: [DatabaseService, LoginLimiter], useFactory: async (db: DatabaseService, limiter: LoginLimiter) =>
          new AuthService(db, limiter, await hashPassword(randomBytes(32).toString('hex'))) },
        { provide: APP_GUARD, useClass: SessionGuard },
        { provide: APP_GUARD, useClass: CsrfGuard },
      ],
    };
  }
}
