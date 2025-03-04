import { EmitterWebhookEvent } from '@octokit/webhooks';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { EventHandler } from '../interfaces/event-handler';
import { prisma } from 'src/database/db-connection';

type EventPayload =
  EmitterWebhookEvent<'pull_request_review_thread'>['payload'];

type PullRequestReviewThreadEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestReviewThreadHandler extends EventHandler<EventPayload> {
  constructor(event: PullRequestReviewThreadEvent) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'resolved':
        await this.handlePullRequestReviewThreadResolved(this.payload);
        break;

      case 'unresolved':
        await this.handlePullRequestReviewThreadUnresolved(this.payload);
        break;

      default:
        break;
    }
  }

  private async handlePullRequestReviewThreadResolved(
    payload: EmitterWebhookEvent<'pull_request_review_thread.resolved'>['payload'],
  ): Promise<void> {
    await prisma.codeReviewComment.updateMany({
      where: {
        id: {
          in: payload.thread.comments.map(({ id }) => id),
        },
      },
      data: {
        resolvedAt: new Date(),
      },
    });
  }

  private async handlePullRequestReviewThreadUnresolved(
    payload: EmitterWebhookEvent<'pull_request_review_thread.unresolved'>['payload'],
  ): Promise<void> {
    await prisma.codeReviewComment.updateMany({
      where: {
        id: {
          in: payload.thread.comments.map(({ id }) => id),
        },
      },
      data: {
        resolvedAt: null,
      },
    });
  }
}
