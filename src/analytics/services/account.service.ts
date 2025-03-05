import { Account, AccountType } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { prisma } from 'src/database/db-connection';
import { AccountFilters } from '../interfaces/record-filters';

export class AccountService {
  async getOrganizations(
    options: AccountFilters,
  ): Promise<PaginatedResponse<Account>> {
    return this.getAccounts('Organization', options);
  }

  async getUsers(options: AccountFilters): Promise<PaginatedResponse<Account>> {
    return this.getAccounts('User', options);
  }

  private async getAccounts(
    type: AccountType,
    options: AccountFilters,
  ): Promise<PaginatedResponse<Account>> {
    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;

    const accounts = await prisma.account.findMany({
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

    const total = await prisma.account.count({
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
    };

    return response;
  }
}
