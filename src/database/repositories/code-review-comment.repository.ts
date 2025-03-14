import { CodeReviewComment } from '@prisma/client';
import { prisma } from 'src/database/db-connection';

export class CodeReviewCommentRepository {
  async saveCodeReviewComment(data: CodeReviewComment): Promise<void> {
    await prisma.codeReviewComment.create({
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

  async updateCodeReviewComments(ids: number[], data: Partial<CodeReviewComment>): Promise<void> {
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
