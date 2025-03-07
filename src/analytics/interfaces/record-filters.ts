import { PaginationOptions } from 'src/common/interfaces/pagination-options';

export interface AccountFilters extends PaginationOptions {
  userId: number;
}

export interface RepositoryFilters extends PaginationOptions {
  userId: number;
  ownerName?: string;
}

export interface PullRequestFilters extends PaginationOptions {
  userId: number;
  ownerName?: string;
  repositoryName?: string;
}

export interface PullRequestReviewFilters extends PaginationOptions {
  userId: number;
  ownerName?: string;
  repositoryName?: string;
  pullRequestNumber?: number;
}
