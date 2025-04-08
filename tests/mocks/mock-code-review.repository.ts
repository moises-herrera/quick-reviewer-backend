import { CodeReview } from '@prisma/client';

export class MockCodeReviewRepository {
  saveCodeReviews(data: CodeReview[]): Promise<void> {
    return Promise.resolve(undefined);
  }
}
