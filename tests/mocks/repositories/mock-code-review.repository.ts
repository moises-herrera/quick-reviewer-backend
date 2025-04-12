import { CodeReview } from '@prisma/client';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { PaginationOptions } from 'src/common/interfaces/pagination-options';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { PullRequestReviewFilters } from 'src/github/interfaces/record-filters';
import { ReviewInfo } from 'src/github/interfaces/review-info';

export class MockCodeReviewRepository implements CodeReviewRepository {
  saveCodeReview = vi
    .fn()
    .mockImplementation((data: CodeReview): Promise<void> => {
      return Promise.resolve(undefined);
    });

  saveCodeReviews = vi
    .fn()
    .mockImplementation((data: CodeReview[]): Promise<void> => {
      return Promise.resolve(undefined);
    });

  getCodeReviews = vi
    .fn()
    .mockImplementation(
      (
        options: PullRequestReviewFilters,
      ): Promise<PaginatedResponse<CodeReview>> => {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
        });
      },
    );

  getCodeReviewsDetailedInfo = vi
    .fn()
    .mockImplementation(
      (
        options: PullRequestFiltersType & PaginationOptions & UserBasicInfo,
      ): Promise<PaginatedResponse<ReviewInfo>> => {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
        });
      },
    );

  getLastCodeReview = vi
    .fn()
    .mockImplementation(
      (options: Partial<CodeReview>): Promise<CodeReview | null> => {
        return Promise.resolve(null);
      },
    );
}
