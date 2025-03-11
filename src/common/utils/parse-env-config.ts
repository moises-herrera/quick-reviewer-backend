import path from 'node:path';
import { config, DotenvConfigOptions, DotenvParseOutput } from 'dotenv';

export const parseEnvConfig = (): DotenvParseOutput => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    return process.env as DotenvParseOutput;
  }

  try {
    const envPath = path.resolve(process.cwd(), `.env.${env}`).trim();
    const result = getEnvConfig({ path: envPath });
    return result;
  } catch {
    return getEnvConfig();
  }
};

export const getEnvConfig = (
  options?: DotenvConfigOptions,
): DotenvParseOutput => {
  const result = config(options);

  if (result.error) {
    throw result.error;
  }

  if (!result.parsed) {
    throw new Error('No environment variables found');
  }

  return result.parsed;
};
