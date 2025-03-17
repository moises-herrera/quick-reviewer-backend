import { DbClient } from 'src/database/db-client';
import { Account, AccountType } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { AccountFilters } from 'src/core/interfaces/record-filters';
import { AccountRepository } from 'src/core/repositories/account.repository';
import { inject, injectable } from 'inversify';
import { AccountWithRepositories } from 'src/core/interfaces/account-with-repositories';

@injectable()
export class PostgresAccountRepository implements AccountRepository {
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async saveAccount({
    repositories,
    ...account
  }: AccountWithRepositories): Promise<Account> {
    return this.dbClient.account.create({
      data: {
        ...account,
        repositories: {
          createMany: {
            data: repositories,
          },
        },
      },
    });
  }

  async getOrganizations(
    options: AccountFilters,
  ): Promise<PaginatedResponse<Account>> {
    return this.getPaginatedAccounts(options, 'Organization');
  }

  async getUsers(options: AccountFilters): Promise<PaginatedResponse<Account>> {
    return this.getPaginatedAccounts(options, 'User');
  }

  async getPaginatedAccounts(
    options: AccountFilters,
    type?: AccountType,
  ): Promise<PaginatedResponse<Account>> {
    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;

    const accounts = await this.dbClient.account.findMany({
      where: {
        type,
        name: {
          contains: options.search,
        },
        users: {
          some: {
            userId: options.userId,
          },
        },
      },
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.dbClient.account.count({
      where: {
        type,
        name: {
          contains: options.search,
        },
        users: {
          some: {
            userId: options.userId,
          },
        },
      },
    });

    const response: PaginatedResponse<Account> = {
      data: accounts,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };

    return response;
  }

  async getAccountsByIds(ids: string[]): Promise<Account[]> {
    return this.dbClient.account.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async deleteAccount(id: string): Promise<void> {
    await this.dbClient.account.delete({
      where: {
        id,
      },
    });
  }
}
