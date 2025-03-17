import { Repository } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { HttpException } from 'src/common/exceptions/http-exception';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from 'src/core/interfaces/record-filters';
import { DbClient } from 'src/database/db-client';
import { ProjectRepository } from 'src/core/repositories/project.repository';

@injectable()
export class PostgresProjectRepository implements ProjectRepository {
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async saveRepositories(repositories: Repository[]): Promise<void> {
    await this.dbClient.repository.createMany({
      data: repositories,
    });
  }

  async saveRepository(repository: Repository): Promise<void> {
    await this.dbClient.repository.create({
      data: repository,
    });
  }

  async getPaginatedRepositories(
    options: RepositoryFilters,
  ): Promise<PaginatedResponse<Repository>> {
    const existingAccount = await this.dbClient.account.findFirst({
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
    const repositories = await this.dbClient.repository.findMany({
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

    const total = await this.dbClient.repository.count({
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

  async getRepositoriesByIds(ids: string[]): Promise<Repository[]> {
    return this.dbClient.repository.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async deleteRepositories(ids: string[]): Promise<void> {
    await this.dbClient.repository.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async deleteRepository(id: string): Promise<void> {
    await this.dbClient.repository.delete({
      where: {
        id,
      },
    });
  }

  async renameRepository(id: string, name: string): Promise<void> {
    await this.dbClient.repository.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }
}
