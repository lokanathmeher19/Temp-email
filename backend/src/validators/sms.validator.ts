import { z } from 'zod';

export const requestNumberSchema = z.object({
  country: z.string().min(2, 'Country code required'),
  service: z.string().min(1, 'Service name required (e.g., Telegram)'),
});
