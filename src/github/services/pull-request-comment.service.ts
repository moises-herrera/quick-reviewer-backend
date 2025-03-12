import { PullRequestComment } from '@prisma/client';
import { prisma } from 'src/database/db-connection';

export class PullRequestCommentService {
  async savePullRequestComment(data: PullRequestComment): Promise<void> {
    await prisma.pullRequestComment.create({
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
