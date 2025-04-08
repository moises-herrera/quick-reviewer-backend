import { PullRequest } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { PullRequestFilters } from 'src/github/interfaces/record-filters';
import { injectable } from 'inversify';
import { PullRequestAuthFilters } from 'src/common/interfaces/pull-request-auth-filters';
import { PullRequestAuthFiltersWithState } from 'src/common/interfaces/pull-request-auth-filters-with-state';
import { EntityId } from 'src/common/interfaces/entity-ids';
import { PullRequestAverageCompletionTimeData } from 'src/common/interfaces/pull-request-average-completion-time-data';
import { PullRequestInitialReviewTimeData } from 'src/common/interfaces/pull-request-initial-review-time-data';
import { PullRequestAverageReviewCountData } from 'src/common/interfaces/pull-request-average-review-count-data';
import { PullRequestReviewCountData } from 'src/common/interfaces/pull-request-review-count-data';
import { PullRequestCountByRepositoryData } from 'src/common/interfaces/pull-request-count-by-repository-data';

@injectable()
export abstract class PullRequestRepository {
  abstract savePullRequest(data: PullRequest): Promise<PullRequest>;
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
    options: PullRequestAuthFilters,
  ): Promise<EntityId[]>;
  abstract findPullRequestsForAverageCompletionTime(
    options: PullRequestFiltersType & UserBasicInfo,
  ): Promise<PullRequestAverageCompletionTimeData[]>;
  abstract findPullRequestsForInitialReviewTime(
    options: PullRequestAuthFiltersWithState,
  ): Promise<PullRequestInitialReviewTimeData[]>;
  abstract findPullRequestsForAverageReviewCount(
    options: PullRequestAuthFiltersWithState,
  ): Promise<PullRequestAverageReviewCountData[]>;
  abstract findPullRequestsForReviewCountByRepository(
    options: PullRequestAuthFiltersWithState,
  ): Promise<PullRequestReviewCountData[]>;
  abstract findPullRequestsForCountByRepository(
    options: PullRequestAuthFilters,
  ): Promise<PullRequestCountByRepositoryData[]>;
}
