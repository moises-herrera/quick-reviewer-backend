import { TestAccount } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { PostgresTestAccountRepository } from 'src/common/database/repositories/postgres-test-account.repository';
import { MockDbClient } from 'tests/mocks/repositories/mock-db-client';

describe('PostgresTestAccountRepository', () => {
  let dbClient: DbClient;
  let testAccountRepository: PostgresTestAccountRepository;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    testAccountRepository = new PostgresTestAccountRepository(dbClient);
  });

  describe('saveTestAccounts', () => {
    const testAccounts: TestAccount[] = [
      {
        id: '1',
        name: 'test-account-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should call dbClient.testAccount.createMany with the correct data', async () => {
      const createManySpy = vi
        .spyOn(dbClient.testAccount, 'createMany')
        .mockResolvedValue({ count: 1 });

      await testAccountRepository.saveTestAccounts(testAccounts);

      expect(createManySpy).toHaveBeenCalledWith({
        data: testAccounts,
      });
    });
  });

  describe('findTestAccountByName', () => {
    it('should call dbClient.testAccount.findFirst with the correct name', async () => {
      const testAccount: TestAccount = {
        id: '1',
        name: 'test-account-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const findFirstSpy = vi
        .spyOn(dbClient.testAccount, 'findFirst')
        .mockResolvedValue(testAccount);

      const result = await testAccountRepository.findTestAccountByName(
        testAccount.name,
      );

      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          name: testAccount.name,
        },
      });
      expect(result).toEqual(testAccount);
    });
  });

  describe('deleteAllTestAccounts', () => {
    it('should call dbClient.testAccount.deleteMany', async () => {
      const deleteManySpy = vi
        .spyOn(dbClient.testAccount, 'deleteMany')
        .mockResolvedValue({ count: 1 });

      await testAccountRepository.deleteAllTestAccounts();

      expect(deleteManySpy).toHaveBeenCalledWith({});
    });
  });
});
