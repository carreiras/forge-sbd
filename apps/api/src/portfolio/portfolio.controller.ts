import { Body, Controller, Get, Inject, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { AuthRequest } from '../auth/auth-request.js';
import { pageQuerySchema, parseId, parseInput } from '../http/validation.js';
import { actorOf } from '../auth/actor.js';
import { applicationInputSchema, projectInputSchema, projectUpdateSchema } from './portfolio.schemas.js';
import { PortfolioService } from './portfolio.service.js';

@Controller()
export class PortfolioController {
  constructor(@Inject(PortfolioService) private readonly portfolio: PortfolioService) {}

  @Get('applications')
  listApplications(@Query() query: unknown) {
    return this.portfolio.listApplications(parseInput(pageQuerySchema, query));
  }

  @Post('applications')
  createApplication(@Body() body: unknown, @Req() request: AuthRequest) {
    return this.portfolio.createApplication(parseInput(applicationInputSchema, body), actorOf(request));
  }

  @Get('applications/:id/projects')
  listProjects(@Param('id') id: string, @Query() query: unknown) {
    return this.portfolio.listProjects(parseId(id), parseInput(pageQuerySchema, query));
  }

  @Post('applications/:id/projects')
  createProject(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthRequest) {
    const applicationId = parseId(id);
    return this.portfolio.createProject(applicationId, parseInput(projectInputSchema, body), actorOf(request));
  }

  @Get('projects/:id')
  getProject(@Param('id') id: string) {
    return this.portfolio.getProject(parseId(id));
  }

  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() body: unknown, @Req() request: AuthRequest) {
    const projectId = parseId(id);
    return this.portfolio.updateProject(projectId, parseInput(projectUpdateSchema, body), actorOf(request));
  }
}
