import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { prisma } from 'src/database/db-connection';

type EventPayload =
  EmitterWebhookEvent<'pull_request_review_comment'>['payload'];

type PullRequestReviewCommentEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestReviewCommentHandler extends EventHandler<EventPayload> {
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
    await prisma.codeReviewComment.create({
      data: {
        id: comment.id,
        body: comment.body,
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
        path: comment.path,
        diffHunk: comment.diff_hunk,
        line: comment.line,
        side: comment.side,
        position: comment.position,
        replyToId: comment.in_reply_to_id,
        codeReviewId: comment.pull_request_review_id as unknown as bigint,
      },
    });
  }

  private async handlePullRequestReviewCommentEdited({
    comment,
  }: EmitterWebhookEvent<'pull_request_review_comment.edited'>['payload']): Promise<void> {
    await prisma.codeReviewComment.update({
      where: {
        id: comment.id,
      },
      data: {
        body: comment.body,
        updatedAt: new Date(comment.updated_at),
      },
    });
  }

  private async handlePullRequestReviewCommentDeleted(
    payload: EmitterWebhookEvent<'pull_request_review_comment.deleted'>['payload'],
  ): Promise<void> {
    await prisma.codeReviewComment.delete({
      where: {
        id: payload.comment.id,
      },
    });
  }
}
