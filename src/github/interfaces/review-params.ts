import { PullRequest } from '@prisma/client';

export interface AIReviewParams {
  pullRequest: PullRequest;
  repository: {
    name: string;
    owner: string;
  };
}

export interface AIReviewContextParams extends AIReviewParams {
  pullRequest: PullRequest;
  repository: {
    name: string;
    owner: string;
  };
  lastCommitReviewed?: string | null;
  readAllCodeLines?: boolean;
}
