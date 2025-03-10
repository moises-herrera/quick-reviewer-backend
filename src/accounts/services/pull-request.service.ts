import { prisma } from 'src/database/db-connection';
import {
  PullRequestFilters,
  PullRequestReviewFilters,
} from '../interfaces/record-filters';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { CodeReview, PullRequest } from '@prisma/client';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';

export class PullRequestService {
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

  async getPullRequestReviews(
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
}
