import { Account } from '@prisma/client';
import { prisma } from 'src/database/db-connection';

export class AccountService {
  async getOrganizations(): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        type: 'Organization',
      },
    });
  }

  async getUsers(): Promise<Account[]> {
    return prisma.account.findMany({
      where: {
        type: 'User',
      },
    });
  }
}
