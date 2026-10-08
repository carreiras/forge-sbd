import { z } from 'zod';
import { domains } from '@forge-sbd/contracts';
import type { Domain } from '@forge-sbd/contracts';

const name = z.string().trim().min(1).max(120);
const description = z.string().trim().max(2000);

export const applicationInputSchema = z.object({ name, description }).strict();

const domainList = z.array(z.enum(domains)).min(1).max(domains.length)
  .refine(values => new Set(values).size === values.length)
  // Canonical order keeps stored contexts comparable regardless of the client's selection order.
  .transform(values => domains.filter(d => values.includes(d)) as Domain[]);
const projectFields = { name, description, owner: z.string().trim().min(1).max(160), domains: domainList };

export const projectInputSchema = z.object(projectFields).strict();
export const projectUpdateSchema = z.object({ revision: z.number().int().min(0).max(2_147_483_647), ...projectFields }).strict();
