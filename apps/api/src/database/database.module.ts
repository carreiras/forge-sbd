import { Global, Module } from '@nestjs/common';
import type { DynamicModule } from '@nestjs/common';
import type { ApiConfig } from '../config.js';
import { DatabaseService } from './database.service.js';

@Global()
@Module({})
export class DatabaseModule {
  static register(config: ApiConfig): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [{ provide: DatabaseService, useFactory: () => new DatabaseService(config.databaseUrl) }],
      exports: [DatabaseService],
    };
  }
}
