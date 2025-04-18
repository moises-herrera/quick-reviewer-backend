import { changeMonths } from 'src/common/utils/date-helper';
import { z } from 'zod';

export const PullRequestFiltersWithStateSchema = z.object({
  repositories: z.array(z.string()),
  status: z.enum(['open', 'closed']).optional(),
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
  endDate: z
    .string()
    .optional()
    .transform((value) => {
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

export type PullRequestFiltersWithStateType = z.infer<
  typeof PullRequestFiltersWithStateSchema
>;
