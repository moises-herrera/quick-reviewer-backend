import { DbClient } from 'src/common/database/db-client';
import { Container } from 'inversify';
import { AccountWithRepositories } from 'src/github/interfaces/account-with-repositories';
import { PostgresAccountRepository } from 'src/common/database/repositories/postgres-account.repository';
import { AccountFilters } from 'src/github/interfaces/record-filters';
import { Account, User } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';

describe.todo('PostgresAccountRepository', () => {
  let container: Container;
  let dbClient: DbClient;
  let accountRepository: PostgresAccountRepository;

  const user: User = {
    id: '001-test-user-id',
    name: 'test-user',
    username: 'test-username',
    email: 'test@email.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const accounts: Account[] = [
    {
      id: '001',
      name: 'test-account0',
      type: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '002',
      name: 'test-account2',
      type: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '003',
      name: 'test-account3',
      type: 'Organization',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '004',
      name: 'test-account4',
      type: 'Organization',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeAll(async () => {
    container = new Container();
    container.bind<DbClient>(DbClient).toSelf().inSingletonScope();
    container
      .bind<PostgresAccountRepository>(PostgresAccountRepository)
      .toSelf();
    dbClient = container.get<DbClient>(DbClient);

    await dbClient.connectToDatabase();
  });

  beforeEach(async () => {
    await dbClient.userAccount.deleteMany({});
    await dbClient.repository.deleteMany({});
    await dbClient.account.deleteMany({});
    await dbClient.user.deleteMany({});

    accountRepository = container.get<PostgresAccountRepository>(
      PostgresAccountRepository,
    );
  });

  afterEach(async () => {
    await dbClient.account.deleteMany({});
    await dbClient.userAccount.deleteMany({});
    await dbClient.user.deleteMany({});
  });

  afterAll(async () => {
    await dbClient.$disconnect();
  });

  describe('Create account', () => {
    it('should create a new account', async () => {
      const accountData: AccountWithRepositories = {
        id: '12345678901234567890',
        name: 'test',
        type: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        repositories: [],
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { repositories, ...expectedResult } = accountData;

      const result = await accountRepository.saveAccount(accountData);
      expect(result).toEqual(expectedResult);

      const accountFound = await dbClient.account.findUnique({
        where: { id: accountData.id },
      });

      expect(accountFound?.id).toEqual(accountData.id);
    });

    it('should create a new account with repositories', async () => {
      const accountData: AccountWithRepositories = {
        id: '90',
        name: 'test-user',
        type: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        repositories: [
          {
            id: '12345678901234567890',
            name: 'test-repo',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { repositories, ...expectedResult } = accountData;

      const result = await accountRepository.saveAccount(accountData);
      expect(result).toEqual(expectedResult);

      const accountFound = await dbClient.account.findUnique({
        where: { id: accountData.id },
      });

      expect(accountFound?.id).toEqual(accountData.id);
    });
  });

  describe('Get accounts', () => {
    beforeEach(async () => {
      await dbClient.user.create({ data: user });
      await dbClient.account.createMany({ data: accounts });
      await dbClient.userAccount.createMany({
        data: [
          {
            userId: user.id,
            accountId: accounts[0].id,
          },
          {
            userId: user.id,
            accountId: accounts[1].id,
          },
          {
            userId: user.id,
            accountId: accounts[2].id,
          },
        ],
      });
    });

    it('should get paginated accounts for the current user', async () => {
      const filters: AccountFilters = {
        search: '',
        page: 1,
        limit: 10,
        userId: user.id,
      };

      const result = await accountRepository.getPaginatedAccounts(filters);

      const expectedResult: PaginatedResponse<Account> = {
        data: expect.any(Array),
        total: 3,
        page: 1,
        totalPages: 1,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should get paginated accounts for the current user with search', async () => {
      const filters: AccountFilters = {
        search: 'test-account3',
        page: 1,
        limit: 10,
        userId: user.id,
      };

      const result = await accountRepository.getPaginatedAccounts(filters);

      const expectedResult: PaginatedResponse<Account> = {
        data: expect.any(Array),
        total: 1,
        page: 1,
        totalPages: 1,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should get paginated accounts for the current user with search and type', async () => {
      const filters: AccountFilters = {
        search: 'test-account3',
        page: 1,
        limit: 10,
        userId: user.id,
      };

      const result = await accountRepository.getPaginatedAccounts(
        filters,
        'Organization',
      );

      const expectedResult: PaginatedResponse<Account> = {
        data: expect.any(Array),
        total: 1,
        page: 1,
        totalPages: 1,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should get 2 pages of accounts for the current user', async () => {
      const filters: AccountFilters = {
        search: 'test-account',
        page: 1,
        limit: 1,
        userId: user.id,
      };

      const result = await accountRepository.getPaginatedAccounts(filters);

      const expectedResult: PaginatedResponse<Account> = {
        data: expect.any(Array),
        total: 3,
        page: 1,
        totalPages: 3,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should get organizations for the current user', async () => {
      const filters: AccountFilters = {
        search: '',
        page: 1,
        limit: 10,
        userId: user.id,
      };

      const result = await accountRepository.getOrganizations(filters);

      const expectedResult: PaginatedResponse<Account> = {
        data: expect.any(Array),
        total: 1,
        page: 1,
        totalPages: 1,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should get user accounts for the current user', async () => {
      const filters: AccountFilters = {
        search: '',
        page: 1,
        limit: 10,
        userId: user.id,
      };

      const result = await accountRepository.getUsers(filters);

      const expectedResult: PaginatedResponse<Account> = {
        data: expect.any(Array),
        total: 2,
        page: 1,
        totalPages: 1,
      };

      expect(result).toBeDefined();
      expect(result).toEqual(expectedResult);
    });

    it('should get accounts by ids', async () => {
      const ids: string[] = ['001', '002'];

      const result = await accountRepository.getAccountsByIds(ids);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('001');
      expect(result[1].id).toBe('002');
    });

    it('should return empty array if no accounts found', async () => {
      const ids: string[] = ['999', '888'];

      const result = await accountRepository.getAccountsByIds(ids);

      expect(result.length).toBe(0);
    });
  });

  describe('Delete account', () => {
    it('should delete an account', async () => {
      const testAccount: Account = {
        id: '800',
        name: 'test-account8',
        type: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await dbClient.account.create({ data: testAccount });

      await accountRepository.deleteAccount(testAccount.id);

      const accountFound = await dbClient.account.findUnique({
        where: { id: testAccount.id },
      });

      expect(accountFound).toBeNull();
    });

    it('should throw an error if account not found', async () => {
      const accountId = '999';

      await expect(
        accountRepository.deleteAccount(accountId),
      ).rejects.toThrowError();
    });
  });
});
