import { prisma } from 'src/database/db-connection';
import {
  PullRequestFilters,
  PullRequestReviewFilters,
} from '../interfaces/record-filters';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { CodeReview, PullRequest } from '@prisma/client';

export class PullRequestService {
  async getPullRequests(
    options: PullRequestFilters,
  ): Promise<PaginatedResponse<PullRequest>> {
    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repository: {
          users: {
            some: {
              userId: options.userId,
            },
          },
        },
        repositoryId: options.repositoryId,
      },
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.pullRequest.count({
      where: {
        repository: {
          users: {
            some: {
              userId: options.userId,
            },
          },
        },
        repositoryId: options.repositoryId,
      },
    });

    const response: PaginatedResponse<PullRequest> = {
      data: pullRequests,
      total,
    };

    return response;
  }

  async getPullRequestReviews(
    options: PullRequestReviewFilters,
  ): Promise<PaginatedResponse<CodeReview>> {
    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const pullRequestReviews = await prisma.codeReview.findMany({
      where: {
        pullRequest: {
          repository: {
            users: {
              some: {
                userId: options.userId,
              },
            },
          },
          id: options.pullRequestId,
        },
      },
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.codeReview.count({
      where: {
        pullRequest: {
          repository: {
            users: {
              some: {
                userId: options.userId,
              },
            },
          },
          id: options.pullRequestId,
        },
      },
    });

    const response: PaginatedResponse<CodeReview> = {
      data: pullRequestReviews,
      total,
    };

    return response;
  }
}
