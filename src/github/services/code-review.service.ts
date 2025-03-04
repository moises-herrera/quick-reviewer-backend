import { prisma } from 'src/database/db-connection';
import { CodeReview } from '@prisma/client';

export class CodeReviewService {
  async saveCodeReview(data: CodeReview): Promise<void> {
    await prisma.codeReview.create({
      data,
    });
  }
}
