import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { prisma } from 'src/database/db-connection';
import { mapCodeReviewToCreation } from '../mappers/code-review.mapper';
import { CodeReviewData } from '../interfaces/code-review-data';

type EventPayload = EmitterWebhookEvent<'pull_request_review'>['payload'];

type PullRequestReviewEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestReviewHandler extends EventHandler<EventPayload> {
  constructor(event: PullRequestReviewEvent) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'submitted':
        await this.handlePullRequestReviewSubmission(this.payload);
        break;

      default:
        break;
    }
  }

  private async handlePullRequestReviewSubmission(
    payload: EmitterWebhookEvent<'pull_request_review.submitted'>['payload'],
  ): Promise<void> {
    try {
      await prisma.codeReview.create({
        data: {
          ...mapCodeReviewToCreation(payload.review as CodeReviewData),
          pullRequestId: payload.pull_request.id,
        },
      });
    } catch (error) {
      console.error('Error creating pull request review:', error);
    }
  }
}
