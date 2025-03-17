import { PullRequestComment } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { DbClient } from 'src/database/db-client';
import { PullRequestCommentRepository } from 'src/core/repositories/pull-request-comment.repository';

@injectable()
export class PostgresPullRequestCommentRepository
  implements PullRequestCommentRepository
{
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async savePullRequestComment(
    data: PullRequestComment,
  ): Promise<PullRequestComment> {
    return this.dbClient.pullRequestComment.create({
      data,
    });
  }

  async savePullRequestComments(data: PullRequestComment[]): Promise<void> {
    await this.dbClient.pullRequestComment.createMany({
      data,
    });
  }

  async getPullRequestComment(
    options: Partial<PullRequestComment>,
  ): Promise<PullRequestComment | null> {
    const pullRequestComment = await this.dbClient.pullRequestComment.findFirst(
      {
        where: options,
        orderBy: {
          createdAt: 'desc',
        },
      },
    );

    return pullRequestComment;
  }

  async getPullRequestComments(
    pullRequestId: string,
  ): Promise<PullRequestComment[]> {
    const pullRequestComments = await this.dbClient.pullRequestComment.findMany(
      {
        where: {
          pullRequestId,
        },
      },
    );

    return pullRequestComments;
  }

  async updatePullRequestComment(
    id: string,
    data: Partial<PullRequestComment>,
  ): Promise<void> {
    await this.dbClient.pullRequestComment.update({
      where: {
        id,
      },
      data,
    });
  }

  async deletePullRequestComment(id: string): Promise<void> {
    await this.dbClient.pullRequestComment.delete({
      where: {
        id,
      },
    });
  }
}
