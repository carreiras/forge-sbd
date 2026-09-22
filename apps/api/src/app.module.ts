import { Controller, Get, Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';
import { AuditService } from './audit/audit.service.js';
import type { ApiConfig } from './config.js';

@Controller('health')
class HealthController {
  @Get()
  health(): { status: 'ok' } { return { status: 'ok' }; }
}

@Module({})
export class AppModule {
  static register(config: ApiConfig): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController],
      providers: [
        { provide: DatabaseService, useFactory: () => new DatabaseService(config.databaseUrl) },
        AuditService,
      ],
      exports: [DatabaseService, AuditService],
    };
  }
}
