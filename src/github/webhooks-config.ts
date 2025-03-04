import { createNodeMiddleware } from '@octokit/webhooks';
import { gitHubApp } from './github-app';
import { envConfig } from 'src/config/env-config';
import { InstallationHandler } from './event-handlers/installation.handler';
import { PullRequestHandler } from './event-handlers/pull-request.handler';
import { RepositoryHandler } from './event-handlers/repository.handler';
import { InstallationRepositoriesHandler } from './event-handlers/installation-repositories.handler';
import { PullRequestReviewHandler } from './event-handlers/pull-request-review.handler';
import { PullRequestReviewThreadHandler } from './event-handlers/pull-request-review-thread.handler';
import { PullRequestReviewCommentHandler } from './event-handlers/pull-request-review-comment.handler';

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

gitHubApp.webhooks.on('pull_request_review', async ({ payload }) => {
  const handler = new PullRequestReviewHandler({ payload });
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review_comment', async ({ payload }) => {
  const handler = new PullRequestReviewCommentHandler({ payload });
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review_thread', async ({ payload }) => {
  const handler = new PullRequestReviewThreadHandler({ payload });
  await handler.handle();
});

export const gitHubWebhooksMiddleware = createNodeMiddleware(
  gitHubApp.webhooks,
  {
    path: envConfig.GITHUB_WEBHOOK_PATH,
  },
);
