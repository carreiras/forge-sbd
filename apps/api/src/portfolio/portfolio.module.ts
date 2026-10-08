import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { PortfolioController } from './portfolio.controller.js';
import { PortfolioService } from './portfolio.service.js';

@Module({ controllers: [PortfolioController], providers: [PortfolioService, AuditService] })
export class PortfolioModule {}
