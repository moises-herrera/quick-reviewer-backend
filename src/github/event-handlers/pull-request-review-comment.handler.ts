import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { mapCodeReviewCommentToCreation } from '../mappers/code-review-comment.mapper';
import { PullRequestReviewCommentEvent } from '../interfaces/events';
import { CodeReviewCommentRepository } from 'src/core/repositories/code-review-comment.repository';

export class PullRequestReviewCommentHandler extends EventHandler<
  PullRequestReviewCommentEvent['payload']
> {
  constructor(
    event: PullRequestReviewCommentEvent,
    private readonly codeReviewCommentRepository: CodeReviewCommentRepository,
  ) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'created':
        await this.handlePullRequestReviewCommentCreated(this.payload);
        break;

      case 'edited':
        await this.handlePullRequestReviewCommentEdited(this.payload);
        break;

      case 'deleted':
        await this.handlePullRequestReviewCommentDeleted(this.payload);
        break;

      default:
        break;
    }
  }

  private async handlePullRequestReviewCommentCreated({
    comment,
  }: EmitterWebhookEvent<'pull_request_review_comment.created'>['payload']): Promise<void> {
    await this.codeReviewCommentRepository.saveCodeReviewComment(
      mapCodeReviewCommentToCreation(comment),
    );
  }

  private async handlePullRequestReviewCommentEdited({
    comment,
  }: EmitterWebhookEvent<'pull_request_review_comment.edited'>['payload']): Promise<void> {
    await this.codeReviewCommentRepository.updateCodeReviewComment(
      comment.id as unknown as bigint,
      {
        body: comment.body,
        updatedAt: new Date(comment.updated_at),
      },
    );
  }

  private async handlePullRequestReviewCommentDeleted(
    payload: EmitterWebhookEvent<'pull_request_review_comment.deleted'>['payload'],
  ): Promise<void> {
    await this.codeReviewCommentRepository.deleteCodeReviewComment(
      payload.comment.id as unknown as bigint,
    );
  }
}
