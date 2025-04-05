import { App } from 'octokit';
import { envConfig } from 'src/app/config/env-config';

export const gitHubApp = new App({
  appId: envConfig.GITHUB_APP_ID,
  privateKey: envConfig.GITHUB_PRIVATE_KEY,
  webhooks: {
    secret: envConfig.GITHUB_WEBHOOK_SECRET,
  },
});
