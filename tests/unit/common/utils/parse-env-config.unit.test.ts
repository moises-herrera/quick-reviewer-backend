import { config } from 'dotenv';
import * as envManager from 'src/common/utils/parse-env-config';
import { Mock } from 'vitest';

vi.mock('node:path', () => ({
  resolve: vi.fn(),
}));

vi.mock('dotenv', () => ({
  config: vi.fn(() => ({
    parsed: {
      DB_URI: 'mongodb://localhost:27017/test',
      PORT: '4000',
    },
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

    const config = envManager.parseEnvConfig();

    expect(config).toEqual(process.env);
  });

  it('should parse the config object from the environment variables', () => {
    process.env.NODE_ENV = 'development';

    const config = envManager.parseEnvConfig();

    expect(config).toEqual({
      DB_URI: 'mongodb://localhost:27017/test',
      PORT: '4000',
    });
  });

  it('should get the env config', () => {
    process.env.NODE_ENV = 'development';

    const result = envManager.getEnvConfig({
      path: 'src/config/.env',
    });

    expect(result).toEqual({
      DB_URI: 'mongodb://localhost:27017/test',
      PORT: '4000',
    });
  });

  it('should throw an error if the config throws an exception', () => {
    process.env.NODE_ENV = 'development';

    (config as unknown as Mock).mockImplementation(() => ({
      error: new Error('Failed to load .env file'),
    }));

    expect(() => envManager.getEnvConfig()).toThrowError(Error);
  });

  it('should throw an error if the config is not found', () => {
    (config as unknown as Mock).mockImplementation(() => ({
      parsed: false,
    }));

    expect(() => envManager.getEnvConfig()).toThrowError(Error);
  });
});
