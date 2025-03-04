import { prisma } from 'src/database/db-connection';
import { Account, Repository } from '@prisma/client';

export class AccountService {
  async saveAccount({
    repositories,
    ...account
  }: Account & {
    repositories: Repository[];
  }): Promise<Account> {
    return prisma.account.create({
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

  async deleteAccount(id: number): Promise<void> {
    await prisma.account.delete({
      where: {
        id,
      },
    });
  }
}
