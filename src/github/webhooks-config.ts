import { createNodeMiddleware } from '@octokit/webhooks';
import { gitHubApp } from './github-app';
import { envConfig } from 'src/config/env-config';
import { InstallationHandler } from './event-handlers/installation.handler';
import { PullRequestHandler } from './event-handlers/pull-request.handler';
import { RepositoryHandler } from './event-handlers/repository.handler';
import { InstallationRepositoriesHandler } from './event-handlers/installation-repositories.handler';

gitHubApp.webhooks.on('installation', async ({ octokit, payload }) => {
  const handler = new InstallationHandler({ octokit, payload });
  await handler.handle();
});

gitHubApp.webhooks.on('installation_repositories', async ({ payload }) => {
  const handler = new InstallationRepositoriesHandler({ payload });
  await handler.handle();
});

gitHubApp.webhooks.on('repository', async ({ payload }) => {
  const handler = new RepositoryHandler({ payload });
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request', async ({ payload }) => {
  const handler = new PullRequestHandler({ payload });
  await handler.handle();
});

export const gitHubWebhooksMiddleware = createNodeMiddleware(
  gitHubApp.webhooks,
  {
    path: envConfig.GITHUB_WEBHOOK_PATH,
  },
);
