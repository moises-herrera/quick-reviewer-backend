import { CodeReviewComment } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class CodeReviewCommentRepository {
  abstract getCodeReviewComments(
    reviewId: number | bigint,
  ): Promise<CodeReviewComment[]>;
  abstract saveCodeReviewComment(data: CodeReviewComment): Promise<void>;
  abstract saveCodeReviewComments(data: CodeReviewComment[]): Promise<void>;
  abstract updateCodeReviewComment(
    id: bigint,
    data: Partial<CodeReviewComment>,
  ): Promise<void>;
  abstract updateCodeReviewComments(
    ids: number[],
    data: Partial<CodeReviewComment>,
  ): Promise<void>;
  abstract deleteCodeReviewComment(id: bigint): Promise<void>;
}
