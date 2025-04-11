import { inject, injectable } from 'inversify';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';
import { DbClient } from '../db-client';
import { TestAccount } from '@prisma/client';

@injectable()
export class PostgresTestAccountRepository implements TestAccountRepository {
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async saveTestAccounts(data: TestAccount[]): Promise<void> {
    await this.dbClient.testAccount.createMany({
      data,
    });
  }

  async findTestAccountByName(name: string): Promise<TestAccount | null> {
    return this.dbClient.testAccount.findFirst({
      where: {
        name,
      },
    });
  }

  async deleteAllTestAccounts(): Promise<void> {
    await this.dbClient.testAccount.deleteMany({});
  }
}
