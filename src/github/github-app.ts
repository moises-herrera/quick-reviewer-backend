import { readFileSync } from 'node:fs';
import { App } from 'octokit';
import { envConfig } from 'src/config/env-config';

export const gitHubApp = new App({
  appId: envConfig.GITHUB_APP_ID,
  privateKey: readFileSync(envConfig.GITHUB_PRIVATE_KEY_PATH, 'utf8'),
  webhooks: {
    secret: envConfig.GITHUB_WEBHOOK_SECRET,
  },
});

export type Octokit = typeof gitHubApp.octokit;
