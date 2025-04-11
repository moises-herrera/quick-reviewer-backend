import { EmitterWebhookEvent } from '@octokit/webhooks';
import { CodeReviewComment } from '@prisma/client';
import { CodeReviewCommentMapper } from 'src/github/mappers/code-review-comment.mapper';

describe('CodeReviewCommentMapper', () => {
  it('should map code review comment to creation', () => {
    const data = {
      id: 123456789,
      body: 'This is a comment',
      created_at: '2023-10-01T00:00:00Z',
      updated_at: '2023-10-01T00:00:00Z',
      path: 'src/file.ts',
      diff_hunk: '@@ -1,2 +1,2 @@',
      line: 10,
      side: 'RIGHT',
      position: 1,
      in_reply_to_id: 9874,
      pull_request_review_id: 987654321,
    } as unknown as EmitterWebhookEvent<'pull_request_review_comment.created'>['payload']['comment'];

    const expectedResult: CodeReviewComment = {
      id: data.id.toString(),
      body: data.body,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      path: data.path,
      diffHunk: data.diff_hunk,
      line: data.line,
      side: data.side,
      position: data.position,
      replyToId: data.in_reply_to_id?.toString() || null,
      codeReviewId: data.pull_request_review_id?.toString() || '',
      resolvedAt: null,
    };

    const result = CodeReviewCommentMapper.mapCodeReviewCommentToCreation(data);

    expect(result).toEqual(expectedResult);
  });
});
