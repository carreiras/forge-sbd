import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { z } from 'zod';
import type { Answers, ApplicationDto, Domain, Page, ProjectDto, Questionnaire } from '@forge-sbd/contracts';
import { AuditService } from '../audit/audit.service.js';
import { QUESTIONNAIRE, questionnaireVersion } from '../content/content.module.js';
import { DatabaseService } from '../database/database.service.js';
import type { Application, Project } from '../generated/prisma/client.js';
import { revisionConflict } from '../http/validation.js';
import type { PageQuery } from '../http/validation.js';
import { resolveConfirmations } from '../surveys/draft-state.js';
import type { applicationInputSchema, projectInputSchema, projectUpdateSchema } from './portfolio.schemas.js';

export type Actor = { actorId: string; requestId: string };
const order = [{ createdAt: 'asc' as const }, { id: 'asc' as const }];

export function toApplicationDto(app: Application): ApplicationDto {
  return { id: app.id, name: app.name, description: app.description, createdAt: app.createdAt.toISOString() };
}
export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id, applicationId: project.applicationId, name: project.name, description: project.description,
    owner: project.owner, domains: project.domains as Domain[], revision: project.revision, createdAt: project.createdAt.toISOString(),
  };
}
function page<T, R>(rows: T[], query: PageQuery, map: (row: T) => R): Page<R> {
  return { items: rows.slice(0, query.limit).map(map), nextOffset: rows.length > query.limit ? query.offset + query.limit : null };
}

@Injectable()
export class PortfolioService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(QUESTIONNAIRE) private readonly survey: Questionnaire,
  ) {}

  async listApplications(query: PageQuery): Promise<Page<ApplicationDto>> {
    const rows = await this.db.application.findMany({ orderBy: order, skip: query.offset, take: query.limit + 1 });
    return page(rows, query, toApplicationDto);
  }

  createApplication(input: z.infer<typeof applicationInputSchema>, actor: Actor): Promise<ApplicationDto> {
    return this.db.$transaction(async tx => {
      const app = await tx.application.create({ data: input });
      await this.audit.record(tx, { ...actor, action: 'application.create', targetId: app.id });
      return toApplicationDto(app);
    });
  }

  async listProjects(applicationId: string, query: PageQuery): Promise<Page<ProjectDto>> {
    const app = await this.db.application.findUnique({ where: { id: applicationId }, select: { id: true } });
    if (!app) throw new NotFoundException();
    const rows = await this.db.project.findMany({ where: { applicationId }, orderBy: order, skip: query.offset, take: query.limit + 1 });
    return page(rows, query, toProjectDto);
  }

  createProject(applicationId: string, input: z.infer<typeof projectInputSchema>, actor: Actor): Promise<ProjectDto> {
    return this.db.$transaction(async tx => {
      const app = await tx.application.findUnique({ where: { id: applicationId }, select: { id: true } });
      if (!app) throw new NotFoundException();
      // The draft is created with the project so every project can be resumed.
      const project = await tx.project.create({ data: { ...input, applicationId,
        surveyDraft: { create: { questionnaireVersion, answers: {}, needsConfirmationIds: [] } } } });
      await this.audit.record(tx, { ...actor, action: 'project.create', targetId: project.id });
      return toProjectDto(project);
    });
  }

  async getProject(id: string): Promise<ProjectDto> {
    const project = await this.db.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException();
    return toProjectDto(project);
  }

  updateProject(id: string, input: z.infer<typeof projectUpdateSchema>, actor: Actor): Promise<ProjectDto> {
    const { revision, ...data } = input;
    return this.db.$transaction(async tx => {
      const current = await tx.project.findUnique({ where: { id }, include: { surveyDraft: true } });
      if (!current?.surveyDraft) throw new NotFoundException();
      const conflict = () => revisionConflict('O projeto foi alterado. Recarregue antes de salvar.');
      if (current.revision !== revision) throw conflict();
      const result = await tx.project.updateMany({ where: { id, revision }, data: { ...data, revision: { increment: 1 } } });
      if (result.count !== 1) throw conflict();
      const previousDomains = current.domains as Domain[];
      if (previousDomains.join() !== data.domains.join()) {
        // New domains change which questions are active, so the draft context advances too.
        const draft = current.surveyDraft;
        const answers = draft.answers as Answers;
        const needsConfirmationIds = resolveConfirmations(this.survey,
          { domains: previousDomains, answers, needsConfirmationIds: draft.needsConfirmationIds as string[] },
          { domains: data.domains, answers, settledIds: new Set() });
        const updated = await tx.surveyDraft.updateMany({ where: { projectId: id, revision: draft.revision },
          data: { needsConfirmationIds, revision: { increment: 1 } } });
        if (updated.count !== 1) throw revisionConflict('O questionário foi alterado. Recarregue antes de salvar.');
      }
      await this.audit.record(tx, { ...actor, action: 'project.update', targetId: id });
      return toProjectDto(await tx.project.findUniqueOrThrow({ where: { id } }));
    });
  }
}
