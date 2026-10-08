import { Controller, Get, Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { AuditService } from './audit/audit.service.js';
import type { ApiConfig } from './config.js';
import { AuthModule } from './auth/auth.module.js';
import { Public } from './auth/public.decorator.js';
import { ContentModule } from './content/content.module.js';
import { PortfolioModule } from './portfolio/portfolio.module.js';
import { SurveysModule } from './surveys/surveys.module.js';

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
      imports: [DatabaseModule.register(config), ContentModule.register(config), AuthModule.register(config), PortfolioModule, SurveysModule],
      controllers: [HealthController],
      providers: [AuditService],
      exports: [DatabaseModule, AuditService],
    };
  }
}
