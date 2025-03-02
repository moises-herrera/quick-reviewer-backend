import { createNodeMiddleware } from '@octokit/webhooks';
import { gitHubApp } from './github-app';
import { envConfig } from 'src/config/env-config';
import { handleAppInstallation } from './event-handlers/installation';
import { handlePullRequestEvent } from './event-handlers/pull-request';
import { handleRepositoryEvent } from './event-handlers/repository';
import { handleAppInstallationRepositories } from './event-handlers/installation-repositories';

gitHubApp.webhooks.on('installation', handleAppInstallation);

gitHubApp.webhooks.on(
  'installation_repositories',
  handleAppInstallationRepositories,
);

gitHubApp.webhooks.on('repository', handleRepositoryEvent);

gitHubApp.webhooks.on('pull_request', handlePullRequestEvent);

export const gitHubWebhooksMiddleware = createNodeMiddleware(
  gitHubApp.webhooks,
  {
    path: envConfig.GITHUB_WEBHOOK_PATH,
  },
);
