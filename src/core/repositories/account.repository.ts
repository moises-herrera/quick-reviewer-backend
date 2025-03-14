import { Account, AccountType, Repository } from '@prisma/client';
import { injectable } from 'inversify';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { AccountFilters } from 'src/core/interfaces/record-filters';

@injectable()
export abstract class AccountRepository {
  abstract saveAccount(
    data: Account & { repositories: Repository[] },
  ): Promise<Account>;
  abstract getOrganizations(
    options: AccountFilters,
  ): Promise<PaginatedResponse<Account>>;
  abstract getUsers(
    options: AccountFilters,
  ): Promise<PaginatedResponse<Account>>;
  abstract getAccounts(
    options: AccountFilters,
    type?: AccountType,
  ): Promise<PaginatedResponse<Account>>;
  abstract deleteAccount(id: number): Promise<void>;
}
