import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { prisma } from 'src/database/db-connection';
import { mapPullRequestToCreation } from '../mappers/pull-request.mapper';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';

type EventPayload = EmitterWebhookEvent<'pull_request'>['payload'];

type PullRequestEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestHandler extends EventHandler<EventPayload> {
  constructor(event: PullRequestEvent) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'opened':
        await this.handlePullRequestCreation(this.payload);
        break;

      case 'closed':
        await this.handlePullRequestClosure(this.payload);
        break;

      case 'reopened':
        await this.handlePullRequestReopening(this.payload);
        break;

      case 'synchronize':
        await this.handlePullRequestSynchronization(this.payload);
        break;

      default:
        break;
    }
  }

  private async handlePullRequestCreation(
    payload: EmitterWebhookEvent<'pull_request.opened'>['payload'],
  ): Promise<void> {
    try {
      await prisma.pullRequest.create({
        data: mapPullRequestToCreation(payload),
      });
    } catch (error) {
      console.error('Error creating pull request:', error);
    }
  }

  private async handlePullRequestClosure(
    payload: EmitterWebhookEvent<'pull_request.closed'>['payload'],
  ): Promise<void> {
    try {
      await prisma.pullRequest.update({
        where: {
          id: payload.pull_request.node_id,
        },
        data: {
          state: payload.pull_request.state,
          closedAt: new Date(payload.pull_request.closed_at || Date.now()),
        },
      });
    } catch (error) {
      console.error('Error closing pull request:', error);
    }
  }

  private async handlePullRequestReopening(
    payload: EmitterWebhookEvent<'pull_request.reopened'>['payload'],
  ): Promise<void> {
    try {
      await prisma.pullRequest.update({
        where: {
          id: payload.pull_request.node_id,
        },
        data: {
          state: payload.pull_request.state,
          closedAt: null,
        },
      });
    } catch (error) {
      console.error('Error reopening pull request:', error);
    }
  }

  private async handlePullRequestSynchronization(
    payload: EmitterWebhookEvent<'pull_request.synchronize'>['payload'],
  ): Promise<void> {
    try {
      await prisma.pullRequest.update({
        where: {
          id: payload.pull_request.node_id,
        },
        data: {
          additions: payload.pull_request.additions,
          deletions: payload.pull_request.deletions,
          changedFiles: payload.pull_request.changed_files,
        },
      });
    } catch (error) {
      console.error('Error synchronizing pull request:', error);
    }
  }
}
