import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { mapCodeReviewToCreation } from '../mappers/code-review.mapper';
import { CodeReviewData } from '../interfaces/code-review-data';
import { PullRequestReviewEvent } from '../interfaces/events';
import { CodeReviewRepository } from 'src/core/repositories/code-review.repository';

export class PullRequestReviewHandler extends EventHandler<
  PullRequestReviewEvent['payload']
> {
  constructor(
    event: PullRequestReviewEvent,
    private readonly codeReviewRepository: CodeReviewRepository,
  ) {
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
      await this.codeReviewRepository.saveCodeReview({
        ...mapCodeReviewToCreation(payload.review as CodeReviewData),
        pullRequestId: payload.pull_request.id as unknown as bigint,
      });
    } catch (error) {
      console.error('Error creating pull request review:', error);
    }
  }
}
