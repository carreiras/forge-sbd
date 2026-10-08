import { BadRequestException, ConflictException } from '@nestjs/common';
import { z } from 'zod';

export function parseInput<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new BadRequestException();
  return parsed.data;
}

export const idSchema = z.uuid();
export const parseId = (value: unknown): string => parseInput(idSchema, value);

export const pageQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
}).strict();
export type PageQuery = z.infer<typeof pageQuerySchema>;

export function revisionConflict(message: string): ConflictException {
  return new ConflictException({ code: 'REVISION_CONFLICT', message });
}
