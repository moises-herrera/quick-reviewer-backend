import { Account, AccountType } from '@prisma/client';
import { AccountData } from '../interfaces/account-data';

export const mapAccountToCreation = (account: AccountData): Account =>
  ({
    id: account.id.toString(),
    name: account.login,
    type: account.type as AccountType,
  }) as Account;
