import { CodeReview } from '@prisma/client';
import { CodeReviewData } from '../interfaces/code-review-data';

export const mapCodeReviewToCreation = (data: CodeReviewData): CodeReview => {
  return {
    id: data.id as unknown as bigint,
    reviewer: data.user.login,
    status: data.state,
    createdAt: new Date(data.submitted_at),
  } as CodeReview;
};
