import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { CodeReviewCommentService } from '../services/code-review-comment.service';
import { mapCodeReviewCommentToCreation } from '../mappers/code-review-comment.mapper';

type EventPayload =
  EmitterWebhookEvent<'pull_request_review_comment'>['payload'];

type PullRequestReviewCommentEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestReviewCommentHandler extends EventHandler<EventPayload> {
  private readonly codeReviewCommentService = new CodeReviewCommentService();

  constructor(event: PullRequestReviewCommentEvent) {
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
    await this.codeReviewCommentService.saveCodeReviewComment(
      mapCodeReviewCommentToCreation(comment),
    );
  }

  private async handlePullRequestReviewCommentEdited({
    comment,
  }: EmitterWebhookEvent<'pull_request_review_comment.edited'>['payload']): Promise<void> {
    await this.codeReviewCommentService.updateCodeReviewComment(
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
    await this.codeReviewCommentService.deleteCodeReviewComment(
      payload.comment.id as unknown as bigint,
    );
  }
}
