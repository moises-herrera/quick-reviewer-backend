import { PullRequest } from '@prisma/client';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { PullRequestAuthFilters } from 'src/common/interfaces/pull-request-auth-filters';
import { PullRequestAuthFiltersWithState } from 'src/common/interfaces/pull-request-auth-filters-with-state';

export class MockPullRequestRepository implements PullRequestRepository {
  savePullRequest = vi.fn().mockImplementation((data: PullRequest) => {
    return Promise.resolve(data);
  });

  savePullRequests = vi.fn().mockImplementation((data: PullRequest[]) => {
    return Promise.resolve(undefined);
  });

  getPullRequestById = vi.fn().mockImplementation((pullRequestId: string) => {
    return Promise.resolve(null);
  });

  updatePullRequest = vi
    .fn()
    .mockImplementation((id: string, data: Partial<PullRequest>) => {
      return Promise.resolve(undefined);
    });

  getPullRequests = vi
    .fn()
    .mockImplementation(
      (options: any): Promise<PaginatedResponse<PullRequest>> => {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
        });
      },
    );

  findPullRequestsForAverageCreationCount = vi
    .fn()
    .mockImplementation(
      (options: PullRequestAuthFilters): Promise<{ id: string }[]> => {
        return Promise.resolve([
          {
            id: '1',
          },
        ]);
      },
    );

  findPullRequestsForAverageCompletionTime = vi
    .fn()
    .mockImplementation(
      (
        options: PullRequestAuthFiltersWithState,
      ): Promise<{ createdAt: Date; closedAt: Date | null }[]> => {
        return Promise.resolve([
          {
            createdAt: new Date(),
            closedAt: null,
          },
        ]);
      },
    );

  findPullRequestsForInitialReviewTime = vi.fn().mockImplementation(
    (
      options: PullRequestAuthFilters,
    ): Promise<
      {
        createdAt: Date;
        closedAt: Date | null;
        reviews: {
          createdAt: Date;
        }[];
      }[]
    > => {
      return Promise.resolve([
        {
          createdAt: new Date(),
          closedAt: null,
          reviews: [
            {
              createdAt: new Date(),
            },
          ],
        },
      ]);
    },
  );

  findPullRequestsForAverageReviewCount = vi
    .fn()
    .mockImplementation(
      (
        options: PullRequestAuthFilters,
      ): Promise<{ reviews: { id: string }[] }[]> => {
        return Promise.resolve([
          {
            reviews: [
              {
                id: '1',
              },
            ],
          },
        ]);
      },
    );

  findPullRequestsForReviewCountByRepository = vi.fn().mockImplementation(
    (
      options: PullRequestAuthFilters,
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
    > => {
      return Promise.resolve([
        {
          repositoryId: '1',
          repository: {
            name: 'repo',
            owner: {
              name: 'owner',
            },
          },
          reviews: [
            {
              id: '1',
            },
          ],
        },
      ]);
    },
  );

  findPullRequestsForCountByRepository = vi.fn().mockImplementation(
    (
      options: PullRequestAuthFilters,
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
    > => {
      return Promise.resolve([
        {
          repositoryId: '1',
          repository: {
            name: 'repo',
            owner: {
              name: 'owner',
            },
          },
        },
      ]);
    },
  );
}
