import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { PullRequestReviewThreadEvent } from '../interfaces/events';
import { CodeReviewCommentRepository } from 'src/core/repositories/code-review-comment.repository';

export class PullRequestReviewThreadHandler extends EventHandler<
  PullRequestReviewThreadEvent['payload']
> {
  constructor(
    event: PullRequestReviewThreadEvent,
    private readonly codeReviewCommentRepository: CodeReviewCommentRepository,
  ) {
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
    await this.codeReviewCommentRepository.updateCodeReviewComments(
      payload.thread.comments.map(({ id }) => id.toString()),
      {
        resolvedAt: new Date(),
      },
    );
  }

  private async handlePullRequestReviewThreadUnresolved(
    payload: EmitterWebhookEvent<'pull_request_review_thread.unresolved'>['payload'],
  ): Promise<void> {
    await this.codeReviewCommentRepository.updateCodeReviewComments(
      payload.thread.comments.map(({ id }) => id.toString()),
      {
        resolvedAt: null,
      },
    );
  }
}
