import { PullRequest } from '@prisma/client';

export interface AIReviewParams {
  pullRequest: PullRequest;
  repository: {
    name: string;
    owner: string;
  };
  includeFileContents?: boolean;
  includeFileComments?: boolean;
}
