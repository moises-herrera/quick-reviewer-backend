import { PullRequestComment } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class PullRequestCommentRepository {
  abstract savePullRequestComment(
    comment: PullRequestComment,
  ): Promise<PullRequestComment>;
  abstract savePullRequestComments(
    comments: PullRequestComment[],
  ): Promise<void>;
  abstract getPullRequestComment(
    options: Partial<PullRequestComment>,
  ): Promise<PullRequestComment | null>;
  abstract getPullRequestComments(
    pullRequestId: string,
  ): Promise<PullRequestComment[]>;
  abstract updatePullRequestComment(
    id: string,
    data: Partial<PullRequestComment>,
  ): Promise<void>;
  abstract deletePullRequestComment(id: string): Promise<void>;
}
