import { Account, AccountType, Repository } from '@prisma/client';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { AccountFilters } from 'src/github/interfaces/record-filters';

export class MockAccountRepository implements AccountRepository {
  saveAccount = vi
    .fn()
    .mockImplementation(
      (data: Account & { repositories: Repository[] }): Promise<Account> => {
        return Promise.resolve({
          ...data,
          repositories: [],
        });
      },
    );

  getOrganizations = vi
    .fn()
    .mockImplementation((filters: AccountFilters): Promise<Account[]> => {
      return Promise.resolve([]);
    });

  getUsers = vi
    .fn()
    .mockImplementation((filters: AccountFilters): Promise<Account[]> => {
      return Promise.resolve([]);
    });

  getPaginatedAccounts = vi
    .fn()
    .mockImplementation(
      (
        options: AccountFilters,
        type?: AccountType,
      ): Promise<PaginatedResponse<Account>> => {
        return Promise.resolve({
          data: [],
          total: 0,
          page: options.page || 1,
          limit: options.limit || 10,
        });
      },
    );

  getAccountsByIds = vi
    .fn()
    .mockImplementation((ids: string[]): Promise<Account[]> => {
      return Promise.resolve([]);
    });

  deleteAccount = vi.fn().mockImplementation((id: string): Promise<void> => {
    return Promise.resolve();
  });
}
