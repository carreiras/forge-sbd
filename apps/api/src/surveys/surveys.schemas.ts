import { z } from 'zod';

const questionId = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,119}$/);
const option = z.string().min(1).max(120);
export const answerSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('unknown') }).strict(),
  z.object({ state: z.literal('known'), value: z.union([z.boolean(), option, z.array(option).min(1).max(100)]) }).strict(),
]);

export const surveyPatchSchema = z.object({
  revision: z.number().int().min(0).max(2_147_483_647),
  answers: z.record(questionId, answerSchema).refine(value => Object.keys(value).length <= 200),
  confirmedIds: z.array(questionId).max(200),
}).strict();
