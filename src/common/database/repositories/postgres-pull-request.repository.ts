import { PullRequest } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { DbClient } from 'src/common/database/db-client';
import { PullRequestFilters } from 'src/github/interfaces/record-filters';
import { inject, injectable } from 'inversify';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { PullRequestInitialReviewTimeData } from 'src/common/interfaces/pull-request-initial-review-time-data';
import { PullRequestAuthFiltersWithState } from 'src/common/interfaces/pull-request-auth-filters-with-state';
import { PullRequestAuthFilters } from 'src/common/interfaces/pull-request-auth-filters';
import { EntityId } from 'src/common/interfaces/entity-id';
import { PullRequestAverageCompletionTimeData } from 'src/common/interfaces/pull-request-average-completion-time-data';
import { PullRequestAverageReviewCountData } from 'src/common/interfaces/pull-request-average-review-count-data';
import { PullRequestReviewCountData } from 'src/common/interfaces/pull-request-review-count-data';
import { PullRequestCountByRepositoryData } from 'src/common/interfaces/pull-request-count-by-repository-data';

@injectable()
export class PostgresPullRequestRepository implements PullRequestRepository {
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async savePullRequest(data: PullRequest): Promise<PullRequest> {
    return this.dbClient.pullRequest.create({
      data,
    });
  }

  async savePullRequests(data: PullRequest[]): Promise<void> {
    await this.dbClient.pullRequest.createMany({
      data,
    });
  }

  async getPullRequestById(pullRequestId: string): Promise<PullRequest | null> {
    const pullRequest = await this.dbClient.pullRequest.findFirst({
      where: {
        OR: [
          {
            id: pullRequestId,
          },
          {
            nodeId: pullRequestId,
          },
        ],
      },
    });

    return pullRequest;
  }

  async updatePullRequest(
    id: string,
    data: Partial<PullRequest>,
  ): Promise<void> {
    await this.dbClient.pullRequest.update({
      where: {
        id,
      },
      data,
    });
  }

  async getPullRequests(
    options: PullRequestFilters,
  ): Promise<PaginatedResponse<PullRequest>> {
    const isRepositoryId = !isNaN(Number(options.repositoryName));
    const repositoryFilter = {
      where: isRepositoryId
        ? {
            id: options.repositoryName,
            users: {
              some: {
                userId: options.userId,
              },
            },
          }
        : {
            name: options.repositoryName,
            owner: {
              name: options.ownerName,
            },
            users: {
              some: {
                userId: options.userId,
              },
            },
          },
    } as const;
    const existingRepository =
      await this.dbClient.repository.findFirst(repositoryFilter);

    if (!existingRepository) {
      throw new HttpException('Repository not found', StatusCodes.NOT_FOUND);
    }

    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const filter = {
      where: {
        repository: {
          id: existingRepository.id,
        },
        title: {
          contains: options.search,
          mode: 'insensitive',
        },
      },
    } as const;
    const pullRequests = await this.dbClient.pullRequest.findMany({
      ...filter,
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await this.dbClient.pullRequest.count(filter);

    const response: PaginatedResponse<PullRequest> = {
      data: pullRequests,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };

    return response;
  }

  async findPullRequestsForAverageCreationCount({
    userId,
    repositories,
    startDate,
    endDate,
  }: PullRequestAuthFilters): Promise<EntityId[]> {
    return this.dbClient.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        id: true,
      },
    });
  }

  async findPullRequestsForAverageCompletionTime({
    userId,
    repositories,
    startDate,
    endDate,
  }: PullRequestAuthFilters): Promise<PullRequestAverageCompletionTimeData[]> {
    return this.dbClient.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: 'closed',
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        mergedAt: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        closedAt: true,
      },
    });
  }

  async findPullRequestsForInitialReviewTime({
    userId,
    repositories,
    status,
    startDate,
    endDate,
  }: PullRequestAuthFiltersWithState): Promise<
    PullRequestInitialReviewTimeData[]
  > {
    return this.dbClient.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: status,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        reviews: {
          some: {
            id: {
              not: undefined,
            },
          },
        },
      },
      select: {
        createdAt: true,
        reviews: {
          select: {
            createdAt: true,
          },
        },
      },
    });
  }

  async findPullRequestsForAverageReviewCount({
    userId,
    repositories,
    status,
    startDate,
    endDate,
  }: PullRequestAuthFiltersWithState): Promise<
    PullRequestAverageReviewCountData[]
  > {
    return this.dbClient.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: status,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        reviews: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findPullRequestsForReviewCountByRepository({
    userId,
    repositories,
    status,
    startDate,
    endDate,
  }: PullRequestAuthFiltersWithState): Promise<PullRequestReviewCountData[]> {
    return this.dbClient.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: status,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        repositoryId: true,
        repository: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findPullRequestsForCountByRepository({
    userId,
    repositories,
    startDate,
    endDate,
  }: PullRequestAuthFilters): Promise<PullRequestCountByRepositoryData[]> {
    return this.dbClient.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        repositoryId: true,
        repository: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
