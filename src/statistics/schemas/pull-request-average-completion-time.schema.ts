import { changeMonths } from 'src/common/utils/date-helper';
import { z } from 'zod';

export const PullRequestAverageCompletionTimeSchema = z.object({
  repositories: z.array(z.number()),
  startDate: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return changeMonths(new Date(), -1);
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid start date');
      }
      return date;
    }),
  endDate: z.string().transform((value) => {
    if (!value) {
      return new Date();
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid end date');
    }
    return date;
  }),
});

export type PullRequestAverageCompletionTime = z.infer<
  typeof PullRequestAverageCompletionTimeSchema
>;
