import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import type { z } from 'zod';
import type { Answer, Answers, Domain, Questionnaire, SurveyDraftDto } from '@forge-sbd/contracts';
import { AuditService } from '../audit/audit.service.js';
import { QUESTIONNAIRE } from '../content/content.module.js';
import { DatabaseService } from '../database/database.service.js';
import type { SurveyDraft } from '../generated/prisma/client.js';
import { revisionConflict } from '../http/validation.js';
import { resolveConfirmations } from './draft-state.js';
import type { surveyPatchSchema } from './surveys.schemas.js';

function toDraftDto(draft: SurveyDraft): SurveyDraftDto {
  return {
    questionnaireVersion: draft.questionnaireVersion, revision: draft.revision,
    answers: draft.answers as Answers, needsConfirmationIds: draft.needsConfirmationIds as string[],
  };
}

function sameAnswer(stored: Answer | undefined, next: Answer): boolean {
  if (!stored || stored.state !== next.state) return false;
  if (stored.state === 'unknown' || next.state === 'unknown') return true;
  const [a, b] = [stored.value, next.value];
  return Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((v, i) => v === b[i]) : a === b;
}

@Injectable()
export class SurveysService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(AuditService) private readonly audit: AuditService,
    @Inject(QUESTIONNAIRE) private readonly survey: Questionnaire,
  ) {}

  current(): Questionnaire { return this.survey; }

  async getDraft(projectId: string): Promise<SurveyDraftDto> {
    const draft = await this.db.surveyDraft.findUnique({ where: { projectId } });
    if (!draft) throw new NotFoundException();
    return toDraftDto(draft);
  }

  saveDraft(projectId: string, input: z.infer<typeof surveyPatchSchema>, actor: { actorId: string; requestId: string }): Promise<SurveyDraftDto> {
    return this.db.$transaction(async tx => {
      const project = await tx.project.findUnique({ where: { id: projectId }, include: { surveyDraft: true } });
      const draft = project?.surveyDraft;
      if (!project || !draft) throw new NotFoundException();
      const conflict = () => revisionConflict('O questionário foi alterado. Recarregue antes de salvar.');
      if (draft.revision !== input.revision) throw conflict();
      const questionIds = new Set(this.survey.questions.map(q => q.id));
      if (input.confirmedIds.some(id => !questionIds.has(id))) throw new UnprocessableEntityException();
      const domains = project.domains as Domain[];
      const previous = draft.answers as Answers;
      // Present keys replace stored answers; absent keys keep the stored value.
      const answers: Answers = { ...previous, ...input.answers };
      const pending = new Set(draft.needsConfirmationIds as string[]);
      // Only questions the client could see as pending are confirmed; an unchanged answer resent
      // with a parent change (full-form save) is not a confirmation of a question it never saw.
      const settledIds = new Set([
        ...input.confirmedIds.filter(id => pending.has(id)),
        ...Object.entries(input.answers).filter(([id, answer]) => pending.has(id) || !sameAnswer(previous[id], answer)).map(([id]) => id),
      ]);
      const needsConfirmationIds = resolveConfirmations(this.survey,
        { domains, answers: previous, needsConfirmationIds: [...pending] }, { domains, answers, settledIds });
      const result = await tx.surveyDraft.updateMany({
        where: { projectId, revision: input.revision },
        data: { answers, needsConfirmationIds, revision: { increment: 1 } },
      });
      if (result.count !== 1) throw conflict();
      await this.audit.record(tx, { ...actor, action: 'survey.update', targetId: projectId });
      return toDraftDto(await tx.surveyDraft.findUniqueOrThrow({ where: { projectId } }));
    });
  }
}
