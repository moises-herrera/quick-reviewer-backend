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
    const existingRepository = await prisma.repository.findFirst({
      where: {
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
    });

    if (!existingRepository) {
      throw new HttpException('Repository not found', StatusCodes.NOT_FOUND);
    }

    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId: existingRepository.id,
        title: {
          contains: options.search,
          mode: 'insensitive',
        },
      },
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.pullRequest.count({
      where: {
        repositoryId: existingRepository.id,
        title: {
          contains: options.search,
          mode: 'insensitive',
        },
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
    const pullRequestReviews = await prisma.codeReview.findMany({
      where: {
        pullRequestId: existingPullRequest.id,
        reviewer: {
          contains: options.search,
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
        pullRequestId: existingPullRequest.id,
        reviewer: {
          contains: options.search,
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
