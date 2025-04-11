import { PullRequestFiltersSchema } from 'src/common/schemas/pull-request-filters.schema';

describe('PullRequestFiltersSchema', () => {
  it('should validate valid input', () => {
    const validInput = {
      repositories: ['repo1', 'repo2'],
      startDate: new Date('2023-01-01').toISOString(),
      endDate: new Date('2023-01-31').toISOString(),
    };
    const result = PullRequestFiltersSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    expect(result.data?.repositories).toEqual(validInput.repositories);
    expect(result.data?.startDate).toEqual(new Date(validInput.startDate));
    expect(result.data?.endDate).toEqual(new Date(validInput.endDate));
  });

  it('should validate input with missing optional fields', () => {
    const validInput = {
      repositories: ['repo1', 'repo2'],
    };
    const result = PullRequestFiltersSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      ...validInput,
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
  });

  it('should throw an error for invalid startDate', () => {
    const invalidInput = {
      repositories: ['repo1', 'repo2'],
      startDate: 'invalid-date',
    };
    expect(() => PullRequestFiltersSchema.safeParse(invalidInput)).toThrowError(
      Error,
    );
  });

  it('should throw an error for invalid endDate', () => {
    const invalidInput = {
      repositories: ['repo1', 'repo2'],
      endDate: 'invalid-date',
    };
    expect(() => PullRequestFiltersSchema.safeParse(invalidInput)).toThrowError(
      Error,
    );
  });

  it('should use default startDate if not provided', () => {
    const validInput = {
      repositories: ['repo1', 'repo2'],
    };
    const result = PullRequestFiltersSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    expect(result.data?.startDate).toBeInstanceOf(Date);
  });

  it('should use default endDate if not provided', () => {
    const validInput = {
      repositories: ['repo1', 'repo2'],
    };
    const result = PullRequestFiltersSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    expect(result.data?.endDate).toBeInstanceOf(Date);
  });
});
