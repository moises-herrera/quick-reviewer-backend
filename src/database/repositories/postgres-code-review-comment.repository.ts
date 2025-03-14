import { CodeReviewComment } from '@prisma/client';
import { injectable } from 'inversify';
import { prisma } from 'src/database/db-connection';
import { CodeReviewCommentRepository } from '../../core/repositories/code-review-comment.repository';

@injectable()
export class PostgresCodeReviewCommentRepository
  implements CodeReviewCommentRepository
{
  async getCodeReviewComments(
    reviewId: number | bigint,
  ): Promise<CodeReviewComment[]> {
    return prisma.codeReviewComment.findMany({
      where: {
        codeReviewId: reviewId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async saveCodeReviewComment(data: CodeReviewComment): Promise<void> {
    await prisma.codeReviewComment.create({
      data,
    });
  }

  async saveCodeReviewComments(data: CodeReviewComment[]): Promise<void> {
    await prisma.codeReviewComment.createMany({
      data,
    });
  }

  async updateCodeReviewComment(
    id: bigint,
    data: Partial<CodeReviewComment>,
  ): Promise<void> {
    await prisma.codeReviewComment.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteCodeReviewComment(id: bigint): Promise<void> {
    await prisma.codeReviewComment.delete({
      where: {
        id,
      },
    });
  }

  async updateCodeReviewComments(
    ids: number[],
    data: Partial<CodeReviewComment>,
  ): Promise<void> {
    await prisma.codeReviewComment.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data,
    });
  }
}
