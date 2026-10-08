import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { SurveysController } from './surveys.controller.js';
import { SurveysService } from './surveys.service.js';

@Module({ controllers: [SurveysController], providers: [SurveysService, AuditService] })
export class SurveysModule {}
