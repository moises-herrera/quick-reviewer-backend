import { PullRequest } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { PullRequestFiltersWithStateType } from 'src/common/schemas/pull-request-filters-with-state.schema';
import { PullRequestFilters } from 'src/core/interfaces/record-filters';
import { injectable } from 'inversify';

@injectable()
export abstract class PullRequestRepository {
  abstract savePullRequest(data: PullRequest): Promise<void>;
  abstract savePullRequests(data: PullRequest[]): Promise<void>;
  abstract getPullRequestById(
    pullRequestId: string,
  ): Promise<PullRequest | null>;
  abstract updatePullRequest(
    id: string,
    data: Partial<PullRequest>,
  ): Promise<void>;
  abstract getPullRequests(
    options: PullRequestFilters,
  ): Promise<PaginatedResponse<PullRequest>>;
  abstract findPullRequestsForAverageCreationCount(
    options: PullRequestFiltersType & UserBasicInfo,
  ): Promise<
    {
      id: string;
    }[]
  >;
  abstract findPullRequestsForAverageCompletionTime(
    options: PullRequestFiltersType & UserBasicInfo,
  ): Promise<{ createdAt: Date; closedAt: Date | null }[]>;
  abstract findPullRequestsForInitialReviewTime(
    options: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<
    {
      createdAt: Date;
      closedAt: Date | null;
      reviews: {
        createdAt: Date;
      }[];
    }[]
  >;
  abstract findPullRequestsForAverageReviewCount(
    options: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<
    {
      reviews: {
        id: string;
      }[];
    }[]
  >;
  abstract findPullRequestsForReviewCountByRepository(
    options: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<
    {
      repositoryId: string;
      repository: {
        name: string;
        owner: {
          name: string;
        };
      };
      reviews: {
        id: string;
      }[];
    }[]
  >;
  abstract findPullRequestsForCountByRepository(
    options: PullRequestFiltersType & UserBasicInfo,
  ): Promise<
    {
      repositoryId: string;
      repository: {
        name: string;
        owner: {
          name: string;
        };
      };
    }[]
  >;
}
