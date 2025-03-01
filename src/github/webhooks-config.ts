import { createNodeMiddleware } from '@octokit/webhooks';
import { gitHubApp } from './github-app';
import { envConfig } from 'src/config/env-config';

gitHubApp.webhooks.on('installation', async ({ payload }) => {
  console.log(payload);
});

gitHubApp.webhooks.on('repository', async ({ payload }) => {
  console.log(`Repository ${payload.action} for ${payload.repository.name}`);
});

export const middleware = createNodeMiddleware(gitHubApp.webhooks, {
  path: envConfig.GITHUB_WEBHOOK_PATH,
});
