import { z } from 'zod';

export const BotSettingsSchema = z.object({
  autoReviewEnabled: z.boolean().optional(),
  requestChangesWorkflowEnabled: z.boolean().optional(),
});
