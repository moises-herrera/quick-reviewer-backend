import { z } from 'zod';
import { PaginationOptions } from 'src/common/interfaces/pagination-options';

const PaginationOptionsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
});

export const parsePaginationOptions = (
  options: Record<string, unknown>,
): PaginationOptions => {
  const parsedOptions = PaginationOptionsSchema.parse(options);

  return {
    page:
      parsedOptions.page && parsedOptions.page > 0
        ? parsedOptions.page || 1
        : 1,
    limit:
      parsedOptions.limit && parsedOptions.limit > 0
        ? parsedOptions.limit || 10
        : 10,
    search: parsedOptions.search || '',
  };
};
