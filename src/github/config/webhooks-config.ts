import { createNodeMiddleware } from '@octokit/webhooks';
import { gitHubApp } from 'src/github/config/github-app';
import { envConfig } from 'src/config/env-config';
import { container } from 'src/config/container-config';
import { EventHandlerFactory } from 'src/github/factories/event-handler-factory';

const handlerFactory = container.get(EventHandlerFactory);

gitHubApp.webhooks.on('installation', async ({ octokit, payload }) => {
  const eventData = { octokit, payload };
  const handler = handlerFactory.createHandler('installation', eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('installation_repositories', async ({ payload }) => {
  const eventData = { payload };
  const handler = handlerFactory.createHandler(
    'installation_repositories',
    eventData,
  );
  await handler.handle();
});

gitHubApp.webhooks.on('repository', async ({ payload }) => {
  const eventData = { payload };
  const handler = handlerFactory.createHandler('repository', eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request', async ({ octokit, payload }) => {
  const eventData = { octokit, payload };
  const handler = handlerFactory.createHandler('pull_request', eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('issue_comment', async ({ octokit, payload }) => {
  const eventData = { octokit, payload };
  const handler = handlerFactory.createHandler('issue_comment', eventData);
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review', async ({ payload }) => {
  const eventData = { payload };
  const handler = handlerFactory.createHandler(
    'pull_request_review',
    eventData,
  );
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review_comment', async ({ payload }) => {
  const eventData = { payload };
  const handler = handlerFactory.createHandler(
    'pull_request_review_comment',
    eventData,
  );
  await handler.handle();
});

gitHubApp.webhooks.on('pull_request_review_thread', async ({ payload }) => {
  const eventData = { payload };
  const handler = handlerFactory.createHandler(
    'pull_request_review_thread',
    eventData,
  );
  await handler.handle();
});

export const gitHubWebhooksMiddleware = createNodeMiddleware(
  gitHubApp.webhooks,
  {
    path: envConfig.GITHUB_WEBHOOK_PATH,
  },
);
