import { Body, Controller, Get, Inject, Param, Patch, Req } from '@nestjs/common';
import { actorOf } from '../auth/actor.js';
import type { AuthRequest } from '../auth/auth-request.js';
import { parseId, parseInput } from '../http/validation.js';
import { surveyPatchSchema } from './surveys.schemas.js';
import { SurveysService } from './surveys.service.js';

@Controller()
export class SurveysController {
  constructor(@Inject(SurveysService) private readonly surveys: SurveysService) {}

  @Get('questionnaires/current')
  current() { return this.surveys.current(); }

  @Get('projects/:id/survey')
  getDraft(@Param('id') id: string) { return this.surveys.getDraft(parseId(id)); }

  @Patch('projects/:id/survey')
  saveDraft(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthRequest) {
    const projectId = parseId(id);
    return this.surveys.saveDraft(projectId, parseInput(surveyPatchSchema, body), actorOf(request));
  }
}
