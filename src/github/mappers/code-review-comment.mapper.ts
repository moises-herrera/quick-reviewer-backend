import { EmitterWebhookEvent } from '@octokit/webhooks';
import { CodeReviewComment } from '@prisma/client';

export const mapCodeReviewCommentToCreation = (
  comment: EmitterWebhookEvent<'pull_request_review_comment.created'>['payload']['comment'],
): CodeReviewComment => {
  return {
    id: comment.id as unknown as bigint,
    body: comment.body,
    createdAt: new Date(comment.created_at),
    updatedAt: new Date(comment.updated_at),
    path: comment.path,
    diffHunk: comment.diff_hunk,
    line: comment.line,
    side: comment.side,
    position: comment.position,
    replyToId: comment.in_reply_to_id as unknown as bigint,
    codeReviewId: comment.pull_request_review_id as unknown as bigint,
    resolvedAt: null,
  };
};
