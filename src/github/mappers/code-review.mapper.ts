import { CodeReview } from '@prisma/client';
import { CodeReviewData } from '../interfaces/code-review-data';

export const mapCodeReviewToCreation = (data: CodeReviewData): CodeReview => {
  return {
    id: data.node_id,
    reviewer: data.user.login,
    status: data.state,
    createdAt: new Date(data.submitted_at),
    updatedAt: new Date(data.submitted_at),
  } as CodeReview;
};
