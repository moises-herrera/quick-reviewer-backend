import { z } from 'zod';

const RepositoryOptionsSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  includeSettings: z.boolean().optional(),
});

type RepositoryOptions = Required<z.infer<typeof RepositoryOptionsSchema>>;

export const parseRepositoryOptions = (
  options: Record<string, unknown>,
): RepositoryOptions => {
  const parsedOptions = RepositoryOptionsSchema.parse(options);

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
    includeSettings: parsedOptions.includeSettings || false,
  };
};
