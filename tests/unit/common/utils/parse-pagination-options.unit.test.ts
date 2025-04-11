import { parsePaginationOptions } from "src/common/utils/parse-pagination-options";

describe('PaginationOptionsSchema', () => {
  it('should parse valid pagination options', () => {
    const options = {
      page: 1,
      limit: 10,
      search: 'test',
    };

    const parsedOptions = parsePaginationOptions(options);

    expect(parsedOptions).toEqual(options);
  });

  it('should set default values for missing options', () => {
    const options = {};

    const parsedOptions = parsePaginationOptions(options);

    expect(parsedOptions).toEqual({
      page: 1,
      limit: 10,
      search: '',
    });
  });
});
