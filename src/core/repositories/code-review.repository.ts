import { CodeReview } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { PaginationOptions } from 'src/common/interfaces/pagination-options';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { ReviewInfo } from 'src/core/interfaces/review-info';
import { PullRequestReviewFilters } from 'src/core/interfaces/record-filters';
import { injectable } from 'inversify';

@injectable()
export abstract class CodeReviewRepository {
  abstract saveCodeReview(data: CodeReview): Promise<void>;
  abstract saveCodeReviews(data: CodeReview[]): Promise<void>;
  abstract getCodeReviews(
    options: PullRequestReviewFilters,
  ): Promise<PaginatedResponse<CodeReview>>;
  abstract getCodeReviewsDetailedInfo(
    options: PullRequestFiltersType & PaginationOptions & UserBasicInfo,
  ): Promise<PaginatedResponse<ReviewInfo>>;
  abstract getLastCodeReview(
    options: Partial<CodeReview>,
  ): Promise<CodeReview | null>;
}
