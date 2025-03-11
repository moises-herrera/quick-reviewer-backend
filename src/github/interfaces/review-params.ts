import { PullRequest } from '@prisma/client';

export interface ReviewParams {
  pullRequest: PullRequest;
  repository: {
    name: string;
    owner: string;
  };
  includeFileComments?: boolean;
}
