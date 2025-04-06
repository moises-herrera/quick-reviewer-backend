import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { mapCodeReviewToCreation } from '../mappers/code-review.mapper';
import { CodeReviewData } from '../interfaces/code-review-data';
import { PullRequestReviewEvent } from '../interfaces/events';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { LoggerService } from 'src/common/abstracts/logger.abstract';

export class PullRequestReviewHandler extends EventHandler<
  PullRequestReviewEvent['payload']
> {
  constructor(
    event: PullRequestReviewEvent,
    private readonly codeReviewRepository: CodeReviewRepository,
    private readonly loggerService: LoggerService,
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
        pullRequestId: payload.pull_request.id.toString(),
      });
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error creating pull request review',
      });
    }
  }
}
