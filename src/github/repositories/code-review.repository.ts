import { prisma } from 'src/database/db-connection';
import { CodeReview } from '@prisma/client';
import { PullRequestReviewFilters } from '../interfaces/record-filters';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';
import { PaginationOptions } from 'src/common/interfaces/pagination-options';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersType } from 'src/statistics/schemas/pull-request-filters.schema';
import { ReviewInfo } from '../interfaces/review-info';

export class CodeReviewRepository {
  async saveCodeReview(data: CodeReview): Promise<void> {
    await prisma.codeReview.create({
      data,
    });
  }

  async getCodeReviews(
    options: PullRequestReviewFilters,
  ): Promise<PaginatedResponse<CodeReview>> {
    const existingPullRequest = await prisma.pullRequest.findFirst({
      where: {
        number: options.pullRequestNumber,
        repository: {
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
      },
    });

    if (!existingPullRequest) {
      throw new HttpException('Pull request not found', StatusCodes.NOT_FOUND);
    }

    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const pullRequestReviewFilter = {
      where: {
        pullRequestId: existingPullRequest.id,
        reviewer: {
          contains: options.search,
          mode: 'insensitive',
        },
      },
    } as const;
    const pullRequestReviews = await prisma.codeReview.findMany({
      ...pullRequestReviewFilter,
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.codeReview.count(pullRequestReviewFilter);

    const response: PaginatedResponse<CodeReview> = {
      data: pullRequestReviews,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };

    return response;
  }

  async getCodeReviewsDetailedInfo({
    userId,
    repositories,
    startDate,
    endDate,
    page,
    limit,
  }: PullRequestFiltersType &
    PaginationOptions &
    UserBasicInfo): Promise<PaginatedResponse<ReviewInfo>> {
    const filter = {
      pullRequest: {
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
      },
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };
    const reviews = await prisma.codeReview.findMany({
      where: filter,
      select: {
        id: true,
        createdAt: true,
        reviewer: true,
        status: true,
        pullRequest: {
          select: {
            id: true,
            number: true,
            title: true,
            state: true,
            createdAt: true,
            repository: {
              select: {
                id: true,
                name: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalReviews = await prisma.codeReview.count({
      where: filter,
    });

    const totalPages = Math.ceil(totalReviews / limit);

    const response: PaginatedResponse<ReviewInfo> = {
      data: reviews as unknown as ReviewInfo[],
      total: totalReviews,
      page,
      totalPages,
    };

    return response;
  }

  async getCodeReview(
    pullRequestId: bigint,
    commitId: string,
  ): Promise<CodeReview | null> {
    const pullRequestReview = await prisma.codeReview.findFirst({
      where: {
        pullRequestId,
        commitId,
      },
    });

    return pullRequestReview;
  }
}
