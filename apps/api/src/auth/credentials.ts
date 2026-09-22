import { z } from 'zod';

export const credentialsSchema = z.strictObject({
  email: z.string().trim().toLowerCase().max(254).email(),
  password: z.string().min(12).max(128),
});
