import { PullRequest } from '@prisma/client';
import { BotSettings } from './bot-settings';

export interface AIReviewParams {
  pullRequest: PullRequest;
  repository: {
    name: string;
    owner: string;
  };
  settings?: BotSettings;
}

export interface ReviewPullRequestDetailed {
  pullRequest: PullRequest;
  repository: {
    id: string;
    name: string;
    owner: string;
    ownerId: string;
  };
}

export interface AIReviewContextParams extends AIReviewParams {
  lastCommitReviewed?: string | null;
  readAllCodeLines?: boolean;
}
