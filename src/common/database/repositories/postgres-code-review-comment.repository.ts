import { CodeReviewComment } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { DbClient } from 'src/common/database/db-client';
import { CodeReviewCommentRepository } from 'src/common/database/abstracts/code-review-comment.repository';

@injectable()
export class PostgresCodeReviewCommentRepository
  implements CodeReviewCommentRepository
{
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async getCodeReviewComments(reviewId: string): Promise<CodeReviewComment[]> {
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
    id: string,
    data: Partial<CodeReviewComment>,
  ): Promise<void> {
    await this.dbClient.codeReviewComment.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteCodeReviewComment(id: string): Promise<void> {
    await this.dbClient.codeReviewComment.delete({
      where: {
        id,
      },
    });
  }

  async updateCodeReviewComments(
    ids: string[],
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
