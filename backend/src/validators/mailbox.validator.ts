import { z } from 'zod';

export const createMailboxSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Invalid username format').optional(),
  domain: z.string().optional(),
});
