import { Repository } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { HttpException } from 'src/common/exceptions/http-exception';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from 'src/github/interfaces/record-filters';
import { DbClient } from 'src/common/database/db-client';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { RepositoryInfo } from 'src/github/interfaces/repository-info';

@injectable()
export class PostgresProjectRepository implements ProjectRepository {
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async saveRepository(repository: Repository): Promise<Repository> {
    return this.dbClient.repository.create({
      data: repository,
    });
  }

  async saveRepositories(repositories: Repository[]): Promise<void> {
    await this.dbClient.repository.createMany({
      data: repositories,
    });
  }

  async getPaginatedRepositories(
    options: RepositoryFilters,
  ): Promise<PaginatedResponse<RepositoryInfo>> {
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

    const whereClause = {
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
    } as const;
    const selectClause = {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      ownerId: true,
      settings: options.includeSettings
        ? {
            select: {
              autoReviewEnabled: true,
              requestChangesWorkflowEnabled: true,
            },
          }
        : undefined,
    } as const;
    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const repositories = await this.dbClient.repository.findMany({
      ...whereClause,
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
      select: selectClause,
    });

    const total = await this.dbClient.repository.count(whereClause);

    const response: PaginatedResponse<RepositoryInfo> = {
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

  async renameRepository(id: string, name: string): Promise<Repository> {
    return this.dbClient.repository.update({
      where: {
        id,
      },
      data: {
        name,
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

  async deleteRepositories(ids: string[]): Promise<void> {
    await this.dbClient.repository.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
