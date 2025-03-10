import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from '../interfaces/record-filters';
import { Repository } from '@prisma/client';
import { prisma } from 'src/database/db-connection';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';

export class RepositoryService {
  async getRepositories(
    options: RepositoryFilters,
  ): Promise<PaginatedResponse<Repository>> {
    const existingAccount = await prisma.account.findFirst({
      where: {
        name: options.ownerName,
        users: {
          some: {
            userId: options.userId,
          },
        },
      },
    });

    if (!existingAccount) {
      throw new HttpException('Account not found', StatusCodes.NOT_FOUND);
    }

    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const repositories = await prisma.repository.findMany({
      where: {
        name: {
          contains: options.search,
        },
        users: {
          some: {
            userId: options.userId,
          },
        },
        ownerId: existingAccount.id,
      },
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await prisma.repository.count({
      where: {
        name: {
          contains: options.search,
        },
        users: {
          some: {
            userId: options.userId,
          },
        },
        owner: {
          name: options.ownerName,
        },
      },
    });

    const response: PaginatedResponse<Repository> = {
      data: repositories,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };

    return response;
  }
}
