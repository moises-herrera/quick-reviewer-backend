import { Repository } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { prisma } from 'src/database/db-connection';
import { RepositoryFilters } from '../interfaces/record-filters';

export class ProjectRepository {
  async saveRepositories(repositories: Repository[]): Promise<void> {
    await prisma.repository.createMany({
      data: repositories,
    });
  }

  async saveRepository(repository: Repository): Promise<void> {
    await prisma.repository.create({
      data: repository,
    });
  }

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

  async deleteRepositories(ids: number[]): Promise<void> {
    await prisma.repository.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async deleteRepository(id: number): Promise<void> {
    await prisma.repository.delete({
      where: {
        id,
      },
    });
  }

  async renameRepository(id: number, name: string): Promise<void> {
    await prisma.repository.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }
}
