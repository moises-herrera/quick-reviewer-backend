import { PullRequest } from '@prisma/client';

export interface AIReviewParams {
  pullRequest: PullRequest;
  repository: {
    name: string;
    owner: string;
  };
  fullReview?: boolean;
  includeFileContents?: boolean;
}
