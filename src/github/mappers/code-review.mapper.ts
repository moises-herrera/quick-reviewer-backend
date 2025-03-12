import { CodeReview } from '@prisma/client';
import { CodeReviewData } from '../interfaces/code-review-data';

export const mapCodeReviewToCreation = (data: CodeReviewData): CodeReview => {
  return {
    id: data.id as unknown as bigint,
    reviewer: data.user.login,
    body: data.body,
    status: data.state.toUpperCase(),
    createdAt: new Date(data.submitted_at),
    userType: data.user.type,
    commitId: data.commit_id,
  } as CodeReview;
};
