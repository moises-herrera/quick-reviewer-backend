import { Account, AccountType } from '@prisma/client';
import { AccountData } from 'src/github/interfaces/account-data';

export class AccountMapper {
  static mapToCreation(account: AccountData): Account {
    return {
      id: account.id.toString(),
      name: account.login,
      type: account.type as AccountType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
