import { PullRequestComment } from '@prisma/client';
import { injectable } from 'inversify';
import { prisma } from 'src/database/db-connection';
import { PullRequestCommentRepository } from '../../core/repositories/pull-request-comment.repository';

@injectable()
export class PostgresPullRequestCommentRepository
  implements PullRequestCommentRepository
{
  async savePullRequestComment(
    data: PullRequestComment,
  ): Promise<PullRequestComment> {
    return prisma.pullRequestComment.create({
      data,
    });
  }

  async savePullRequestComments(data: PullRequestComment[]): Promise<void> {
    await prisma.pullRequestComment.createMany({
      data,
    });
  }

  async getPullRequestComment(
    pullRequestId: bigint,
    user: string,
    type: string,
  ): Promise<PullRequestComment | null> {
    const pullRequestComment = await prisma.pullRequestComment.findFirst({
      where: {
        pullRequestId,
        user,
        type,
      },
    });

    return pullRequestComment;
  }

  async getPullRequestComments(
    pullRequestId: bigint,
  ): Promise<PullRequestComment[]> {
    const pullRequestComments = await prisma.pullRequestComment.findMany({
      where: {
        pullRequestId,
      },
    });

    return pullRequestComments;
  }

  async updatePullRequestComment(
    id: bigint,
    data: Partial<PullRequestComment>,
  ): Promise<void> {
    await prisma.pullRequestComment.update({
      where: {
        id,
      },
      data,
    });
  }

  async deletePullRequestComment(id: bigint): Promise<void> {
    await prisma.pullRequestComment.delete({
      where: {
        id,
      },
    });
  }
}
