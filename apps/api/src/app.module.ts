import { Controller, Get, Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { AuditService } from './audit/audit.service.js';
import type { ApiConfig } from './config.js';
import { AuthModule } from './auth/auth.module.js';
import { Public } from './auth/public.decorator.js';

@Controller('health')
class HealthController {
  @Public()
  @Get()
  health(): { status: 'ok' } { return { status: 'ok' }; }
}

@Module({})
export class AppModule {
  static register(config: ApiConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.register(config), AuthModule.register(config)],
      controllers: [HealthController],
      providers: [AuditService],
      exports: [DatabaseModule, AuditService],
    };
  }
}
