import 'dotenv/config';
import { z } from 'zod';

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
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_PRIVATE_KEY_PATH: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_WEBHOOK_PATH: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

const { data, error } = EnvSchema.safeParse(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envConfig: EnvConfig = data;
