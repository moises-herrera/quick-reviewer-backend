import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from '../interfaces/record-filters';
import { Repository } from '@prisma/client';
import { prisma } from 'src/database/db-connection';

export class RepositoryService {
  async getRepositories(
    options: RepositoryFilters,
  ): Promise<PaginatedResponse<Repository>> {
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
        ownerId: options.ownerId,
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
        ownerId: options.ownerId,
      },
    });

    const response: PaginatedResponse<Repository> = {
      data: repositories,
      total,
    };

    return response;
  }
}
