import { config, DotenvParseOutput } from 'dotenv';
import { DEFAULT_TEST_ENV } from 'src/app/config/test-config';
import * as envManager from 'src/common/utils/parse-env-config';
import { Mock } from 'vitest';

vi.mock('node:path', () => ({
  resolve: vi.fn(),
}));

vi.mock('dotenv', () => ({
  config: vi.fn(() => ({
    parsed: DEFAULT_TEST_ENV,
    error: null,
  })),
}));

describe('parseEnvConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return the default config object', () => {
    process.env.NODE_ENV = 'production';

    vi.spyOn(envManager, 'parseEnvConfig').mockImplementation(() => {
      return process.env as DotenvParseOutput;
    });

    const config = envManager.parseEnvConfig();

    expect(config).toEqual(process.env);
  });

  it('should parse the config object from the environment variables', () => {
    process.env.NODE_ENV = 'development';

    const config = envManager.parseEnvConfig();

    expect(config).toEqual(DEFAULT_TEST_ENV);
  });

  it('should get the env config', () => {
    process.env.NODE_ENV = 'development';

    const result = envManager.getEnvConfig({
      path: 'src/config/.env',
    });

    expect(result).toEqual(DEFAULT_TEST_ENV);
  });

  it('should throw an error if the config throws an exception', () => {
    process.env.NODE_ENV = 'development';

    (config as unknown as Mock).mockImplementation(() => ({
      error: new Error('Failed to load .env file'),
    }));

    vi.spyOn(envManager, 'getEnvConfig').mockImplementation(() => {
      throw new Error('No environment variables found');
    });

    expect(() => envManager.getEnvConfig()).toThrowError(Error);
  });

  it('should throw an error if the config is not found', () => {
    (config as unknown as Mock).mockImplementation(() => ({
      parsed: false,
    }));

    vi.spyOn(envManager, 'getEnvConfig').mockImplementation(() => {
      throw new Error('No environment variables found');
    });

    expect(() => envManager.getEnvConfig()).toThrowError(Error);
  });
});
