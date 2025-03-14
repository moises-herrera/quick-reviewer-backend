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
    pullRequestId: bigint,
    user: string,
    type: string,
  ): Promise<PullRequestComment | null>;
  abstract getPullRequestComments(
    pullRequestId: number | bigint,
  ): Promise<PullRequestComment[]>;
  abstract updatePullRequestComment(
    id: bigint,
    data: Partial<PullRequestComment>,
  ): Promise<void>;
  abstract deletePullRequestComment(id: bigint): Promise<void>;
}
