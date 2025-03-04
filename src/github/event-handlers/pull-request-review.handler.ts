import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { mapCodeReviewToCreation } from '../mappers/code-review.mapper';
import { CodeReviewData } from '../interfaces/code-review-data';
import { CodeReviewService } from '../services/code-review.service';

type EventPayload = EmitterWebhookEvent<'pull_request_review'>['payload'];

type PullRequestReviewEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestReviewHandler extends EventHandler<EventPayload> {
  private readonly codeReviewService = new CodeReviewService();

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
      await this.codeReviewService.saveCodeReview({
        ...mapCodeReviewToCreation(payload as unknown as CodeReviewData),
        pullRequestId: payload.pull_request.id as unknown as bigint,
      });
    } catch (error) {
      console.error('Error creating pull request review:', error);
    }
  }
}
