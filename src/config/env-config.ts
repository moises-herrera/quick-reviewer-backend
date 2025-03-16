import { z } from 'zod';
import { parseEnvConfig } from 'src/common/utils/parse-env-config';

const EnvSchema = z.object({
  NODE_ENV: z.preprocess(
    (value) => (value as string).trim(),
    z.enum(['development', 'test', 'production']).default('development'),
  ),
  PORT: z.preprocess(
    (value) => parseInt((value as string).toString(), 10),
    z.number().min(0),
  ),
  FRONTEND_URL: z.string().min(1),
  BACKEND_URL: z.string().optional(),
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_PRIVATE_KEY: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_WEBHOOK_PATH: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

const environmentVariables = parseEnvConfig();
const { data, error } = EnvSchema.safeParse({
  ...environmentVariables,
  BACKEND_URL:
    process.env.BACKEND_URL || `http://localhost:${environmentVariables.PORT}`,
  NODE_ENV: process.env.NODE_ENV || 'development',
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envConfig: EnvConfig = data;
