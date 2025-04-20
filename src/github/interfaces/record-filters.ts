import { PaginationOptions } from 'src/common/interfaces/pagination-options';

export interface AccountFilters extends PaginationOptions {
  userId: string;
}

export interface RepositoryFilters extends PaginationOptions {
  userId: string;
  ownerName?: string;
  includeSettings?: boolean;
}

export interface PullRequestFilters extends PaginationOptions {
  userId: string;
  ownerName: string;
  repositoryName: string;
}

export interface PullRequestReviewFilters extends PaginationOptions {
  userId: string;
  ownerName: string;
  repositoryName: string;
  pullRequestNumber: number;
}
