import { createNodeMiddleware } from '@octokit/webhooks';
import { gitHubApp } from './github-app';
import { envConfig } from 'src/config/env-config';
import { container } from 'src/config/inversify-config';
import { EventHandlerFactory } from '../factories/event-handler-factory';

const handlerFactory = container.get(EventHandlerFactory);

gitHubApp.webhooks.on('installation', async ({ octokit, payload }) => {
  const eventData = { octokit, payload };
  const handler = handlerFactory.createInstallationHandler(eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('installation_repositories', async ({ payload }) => {
  const eventData = { payload };
  const handler =
    handlerFactory.createInstallationRepositoriesHandler(eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('repository', async ({ payload }) => {
  const eventData = { payload };
  const handler = handlerFactory.createRepositoryHandler(eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request', async ({ octokit, payload }) => {
  const eventData = { octokit, payload };
  const handler = handlerFactory.createPullRequestHandler(eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('issue_comment', async ({ octokit, payload }) => {
  const eventData = { octokit, payload };
  const handler = handlerFactory.createIssueCommentHandler(eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review', async ({ payload }) => {
  const eventData = { payload };
  const handler = handlerFactory.createPullRequestReviewHandler(eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review_comment', async ({ payload }) => {
  const eventData = { payload };
  const handler =
    handlerFactory.createPullRequestReviewCommentHandler(eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review_thread', async ({ payload }) => {
  const eventData = { payload };
  const handler =
    handlerFactory.createPullRequestReviewThreadHandler(eventData);
  await handler.handle();
});

export const gitHubWebhooksMiddleware = createNodeMiddleware(
  gitHubApp.webhooks,
  {
    path: envConfig.GITHUB_WEBHOOK_PATH,
  },
);
