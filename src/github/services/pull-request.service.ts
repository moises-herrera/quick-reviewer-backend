import { PullRequest } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { prisma } from 'src/database/db-connection';
import { PullRequestFilters } from '../interfaces/record-filters';

export class PullRequestService {
  async savePullRequest(data: PullRequest): Promise<void> {
    await prisma.pullRequest.create({
      data,
    });
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
}
