import { Account, AccountType, Repository } from '@prisma/client';
import { injectable } from 'inversify';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { AccountFilters } from 'src/github/interfaces/record-filters';

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
  abstract getPaginatedAccounts(
    options: AccountFilters,
    type?: AccountType,
  ): Promise<PaginatedResponse<Account>>;
  abstract getAccountsByIds(ids: string[]): Promise<Account[]>;
  abstract deleteAccount(id: string): Promise<void>;
}
