import { TestAccount } from '@prisma/client';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';

export class MockTestAccountRepository implements TestAccountRepository {
  saveTestAccounts = vi.fn((data: TestAccount[]): Promise<void> => {
    return Promise.resolve();
  });

  findTestAccountByName = vi.fn((name: string): Promise<TestAccount | null> => {
    return Promise.resolve(null);
  });

  deleteAllTestAccounts = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });
}
