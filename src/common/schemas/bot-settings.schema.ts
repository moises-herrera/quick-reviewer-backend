import { z } from 'zod';

export const BotSettingsSchema = z.object({
  autoReviewEnabled: z.boolean().default(false),
  requestChangesWorkflowEnabled: z.boolean().default(false),
});
