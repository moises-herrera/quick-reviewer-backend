import { PullRequest } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { prisma } from 'src/database/db-connection';
import { PullRequestFilters } from '../interfaces/record-filters';
import { PullRequestFiltersType } from 'src/statistics/schemas/pull-request-filters.schema';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersWithStateType } from 'src/statistics/schemas/pull-request-filters-with-state.schema';

export class PullRequestRepository {
  async savePullRequest(data: PullRequest): Promise<void> {
    await prisma.pullRequest.create({
      data,
    });
  }

  async getPullRequestById(
    pullRequestId: number | string,
  ): Promise<PullRequest | null> {
    const pullRequest = await prisma.pullRequest.findFirst({
      where:
        typeof pullRequestId === 'string'
          ? { nodeId: pullRequestId }
          : { id: pullRequestId },
    });

    if (!pullRequest) {
      throw new HttpException('Pull request not found', StatusCodes.NOT_FOUND);
    }

    return pullRequest;
  }

  async updatePullRequest(
    id: number,
    data: Partial<PullRequest>,
  ): Promise<void> {
    await prisma.pullRequest.update({
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
            id: Number(options.repositoryName),
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
      await prisma.repository.findFirst(repositoryFilter);

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
    const pullRequests = await prisma.pullRequest.findMany({
      ...filter,
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.pullRequest.count(filter);

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
  }: PullRequestFiltersType & UserBasicInfo) {
    return prisma.pullRequest.findMany({
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
  }: PullRequestFiltersType & UserBasicInfo) {
    return prisma.pullRequest.findMany({
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
  }: PullRequestFiltersWithStateType & UserBasicInfo) {
    return prisma.pullRequest.findMany({
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
        closedAt: true,
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
  }: PullRequestFiltersWithStateType & UserBasicInfo) {
    return prisma.pullRequest.findMany({
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
  }: PullRequestFiltersWithStateType & UserBasicInfo) {
    return prisma.pullRequest.findMany({
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
  }: PullRequestFiltersType & UserBasicInfo) {
    return prisma.pullRequest.findMany({
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
