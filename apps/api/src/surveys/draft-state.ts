import { UnprocessableEntityException } from '@nestjs/common';
import { deriveContext } from '@forge-sbd/rules';
import type { Answers, Domain, Questionnaire } from '@forge-sbd/contracts';

export type DraftState = { domains: Domain[]; answers: Answers; needsConfirmationIds: string[] };

function activeIds(survey: Questionnaire, domains: Domain[], answers: Answers, needs: string[]): Set<string> {
  try { return new Set(deriveContext(survey, domains, answers, needs).activeQuestionIds); }
  catch { throw new UnprocessableEntityException(); }
}

/**
 * Recomputes which stored answers need confirmation after domains or answers change.
 * A question that becomes active again keeps its old answer, but the answer stays out of
 * the facts until it is confirmed or replaced. Unconfirmed answers can hide facts that other
 * questions depend on, so the active set is recomputed until it is stable.
 */
export function resolveConfirmations(survey: Questionnaire, previous: DraftState, next: {
  domains: Domain[]; answers: Answers; settledIds: ReadonlySet<string>;
}): string[] {
  const before = activeIds(survey, previous.domains, previous.answers, previous.needsConfirmationIds);
  const pending = (id: string) => next.answers[id] !== undefined && !next.settledIds.has(id);
  const needs = new Set(previous.needsConfirmationIds.filter(pending));
  for (;;) {
    const reactivated = [...activeIds(survey, next.domains, next.answers, [...needs])]
      .filter(id => !before.has(id) && pending(id) && !needs.has(id));
    if (reactivated.length === 0) break;
    reactivated.forEach(id => needs.add(id));
  }
  return survey.questions.map(q => q.id).filter(id => needs.has(id));
}
