import { CodeReviewComment } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class CodeReviewCommentRepository {
  abstract getCodeReviewComments(
    reviewId: string,
  ): Promise<CodeReviewComment[]>;
  abstract saveCodeReviewComment(data: CodeReviewComment): Promise<void>;
  abstract saveCodeReviewComments(data: CodeReviewComment[]): Promise<void>;
  abstract updateCodeReviewComment(
    id: string,
    data: Partial<CodeReviewComment>,
  ): Promise<void>;
  abstract updateCodeReviewComments(
    ids: string[],
    data: Partial<CodeReviewComment>,
  ): Promise<void>;
  abstract deleteCodeReviewComment(id: string): Promise<void>;
}
