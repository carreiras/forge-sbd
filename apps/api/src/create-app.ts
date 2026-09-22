import 'reflect-metadata';
import './environment.js';
import { randomUUID } from 'node:crypto';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { readConfig } from './config.js';
import { ApiExceptionFilter } from './http/api-exception.filter.js';
import type { ApiRequest } from './http/api-exception.filter.js';

export async function createApp(env: NodeJS.ProcessEnv = process.env): Promise<INestApplication> {
  const config = readConfig(env);
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(config), {
    logger: false, abortOnError: false, bodyParser: false,
  });
  try {
    app.setGlobalPrefix('api/v1');
    app.use((req: ApiRequest, res: Response, next: NextFunction) => {
      req.requestId = randomUUID();
      res.setHeader('X-Request-Id', req.requestId);
      next();
    });
    app.use(helmet());
    app.useBodyParser('json', { limit: '128kb' });
    app.use(cookieParser());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
    return app;
  } catch (error) {
    await app.close();
    throw error;
  }
}
