import { createNodeMiddleware } from '@octokit/webhooks';
import { gitHubApp } from 'src/github/config/github-app';
import { envConfig } from 'src/app/config/env-config';
import { container } from 'src/app/config/container-config';
import {
  EventHandlerFactory,
  EventTypeMap,
} from 'src/github/factories/event-handler-factory';

export const registerWebhooks = () => {
  const handlerFactory = container.get(EventHandlerFactory);

  const eventTypes: (keyof EventTypeMap)[] = [
    'installation',
    'installation_repositories',
    'repository',
    'pull_request',
    'issue_comment',
    'pull_request_review',
    'pull_request_review_comment',
    'pull_request_review_thread',
  ];

  eventTypes.forEach((eventType) => {
    gitHubApp.webhooks.on(eventType, async ({ octokit, payload }) => {
      try {
        const event = {
          octokit,
          payload,
        } as EventTypeMap[keyof EventTypeMap];
        const handler = handlerFactory.createHandler(eventType, event);
        await handler.handle();
      } catch (error) {
        console.error(`Error handling event ${eventType}:`, error);
      }
    });
  });
};

registerWebhooks();

export const gitHubWebhooksMiddleware = createNodeMiddleware(
  gitHubApp.webhooks,
  {
    path: envConfig.GITHUB_WEBHOOK_PATH,
  },
);
