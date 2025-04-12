const envConfig = vi.hoisted(() => ({
  NODE_ENV: 'test',
  PORT: '3000',
  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:4000',
  GITHUB_APP_ID: '12345',
  GITHUB_PRIVATE_KEY: 'github_private_key',
  GITHUB_WEBHOOK_SECRET: 'test_webhook_secret',
  GITHUB_WEBHOOK_PATH: '/github/webhook',
  GITHUB_CLIENT_ID: 'test_client_id',
  GITHUB_CLIENT_SECRET: 'test_client_secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  ANTHROPIC_API_KEY: 'test_anthropic_key',
}));

const router = vi.hoisted(() => ({
  get: vi.fn().mockReturnThis(),
  post: vi.fn().mockReturnThis(),
  put: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  patch: vi.fn().mockReturnThis(),
  all: vi.fn().mockReturnThis(),
  use: vi.fn().mockReturnThis(),
}));

vi.mock('src/common/utils/parse-env-config', () => ({
  parseEnvConfig: () => envConfig,
  getEnvConfig: () => envConfig,
}));

vi.mock('express', async (originalImport) => {
  const actual = await originalImport();

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...actual as any,
    Router: vi.fn(() => router),
  };
});
