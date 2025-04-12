import { PullRequestComment } from '@prisma/client';
import { PullRequestCommentRepository } from 'src/common/database/abstracts/pull-request-comment.repository';

export class MockPullRequestCommentRepository
  implements PullRequestCommentRepository
{
  savePullRequestComment = vi.fn(
    (comment: PullRequestComment): Promise<PullRequestComment> => {
      return Promise.resolve(comment);
    },
  );

  savePullRequestComments = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });

  getPullRequestComment = vi.fn(
    (
      options: Partial<PullRequestComment>,
    ): Promise<PullRequestComment | null> => {
      return Promise.resolve(options as PullRequestComment);
    },
  );

  getPullRequestComments = vi.fn((): Promise<PullRequestComment[]> => {
    return Promise.resolve([]);
  });

  updatePullRequestComment = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });

  deletePullRequestComment = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });
}
