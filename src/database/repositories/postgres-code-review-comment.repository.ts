import { CodeReviewComment } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { DbClient } from 'src/database/db-client';
import { CodeReviewCommentRepository } from 'src/core/repositories/code-review-comment.repository';

@injectable()
export class PostgresCodeReviewCommentRepository
  implements CodeReviewCommentRepository
{
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async getCodeReviewComments(
    reviewId: number | bigint,
  ): Promise<CodeReviewComment[]> {
    return this.dbClient.codeReviewComment.findMany({
      where: {
        codeReviewId: reviewId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async saveCodeReviewComment(data: CodeReviewComment): Promise<void> {
    await this.dbClient.codeReviewComment.create({
      data,
    });
  }

  async saveCodeReviewComments(data: CodeReviewComment[]): Promise<void> {
    await this.dbClient.codeReviewComment.createMany({
      data,
    });
  }

  async updateCodeReviewComment(
    id: bigint,
    data: Partial<CodeReviewComment>,
  ): Promise<void> {
    await this.dbClient.codeReviewComment.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteCodeReviewComment(id: bigint): Promise<void> {
    await this.dbClient.codeReviewComment.delete({
      where: {
        id,
      },
    });
  }

  async updateCodeReviewComments(
    ids: number[],
    data: Partial<CodeReviewComment>,
  ): Promise<void> {
    await this.dbClient.codeReviewComment.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data,
    });
  }
}
