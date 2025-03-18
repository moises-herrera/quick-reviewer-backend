import { TestAccount } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class TestAccountRepository {
  abstract saveTestAccounts(data: TestAccount[]): Promise<void>;
  abstract findTestAccountByName(name: string): Promise<TestAccount | null>;
  abstract deleteAllTestAccounts(): Promise<void>;
}
