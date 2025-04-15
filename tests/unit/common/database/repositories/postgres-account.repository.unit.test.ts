import { Account } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { AccountWithRepositories } from 'src/github/interfaces/account-with-repositories';
import { AccountFilters } from 'src/github/interfaces/record-filters';
import { DbClient } from 'src/common/database/db-client';
import { PostgresAccountRepository } from 'src/common/database/repositories/postgres-account.repository';
import { MockDbClient } from 'tests/mocks/repositories/mock-db-client';

describe('PostgresAccountRepository', () => {
  let accountRepository: PostgresAccountRepository;
  let dbClient: DbClient;

  const filters: AccountFilters = {
    page: 1,
    limit: 10,
    search: 'test',
    userId: '1',
  };

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    accountRepository = new PostgresAccountRepository(dbClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new account with repositories', async () => {
    const accountData: AccountWithRepositories = {
      id: '1',
      name: 'test-account',
      type: 'User',
      repositories: [
        {
          id: '1',
          name: 'test-repo',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(dbClient.account.create).mockResolvedValue(accountData);

    const result = await accountRepository.saveAccount(accountData);
    expect(result).toEqual(accountData);
    expect(dbClient.account.create).toHaveBeenCalledWith({
      data: {
        ...accountData,
        repositories: {
          createMany: {
            data: accountData.repositories,
          },
        },
      },
    });
  });

  it('should get paginated accounts', async () => {
    const mockedAccounts: Account[] = [
      {
        id: '1',
        name: 'test-account',
        type: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const totalCount = mockedAccounts.length;

    vi.mocked(dbClient.account.findMany).mockResolvedValue(mockedAccounts);
    vi.mocked(dbClient.account.count).mockResolvedValue(totalCount);

    const result = await accountRepository.getPaginatedAccounts(filters);
    const expectedResponse: PaginatedResponse<Account> = {
      data: mockedAccounts,
      total: totalCount,
      page: filters.page,
      totalPages: Math.ceil(totalCount / filters.limit),
    };

    expect(result).toEqual(expectedResponse);
  });

  it('should get organizations', async () => {
    const mockedAccounts: Account[] = [
      {
        id: '1',
        name: 'test-account',
        type: 'Organization',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const totalCount = mockedAccounts.length;

    vi.mocked(dbClient.account.findMany).mockResolvedValue(mockedAccounts);
    vi.mocked(dbClient.account.count).mockResolvedValue(totalCount);

    const result = await accountRepository.getOrganizations(filters);
    const expectedResponse: PaginatedResponse<Account> = {
      data: mockedAccounts,
      total: totalCount,
      page: filters.page,
      totalPages: Math.ceil(totalCount / filters.limit),
    };

    expect(result).toEqual(expectedResponse);
  });

  it('should get users', async () => {
    const mockedAccounts: Account[] = [
      {
        id: '1',
        name: 'test-account',
        type: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const totalCount = mockedAccounts.length;

    vi.mocked(dbClient.account.findMany).mockResolvedValue(mockedAccounts);
    vi.mocked(dbClient.account.count).mockResolvedValue(totalCount);

    const result = await accountRepository.getUsers(filters);
    const expectedResponse: PaginatedResponse<Account> = {
      data: mockedAccounts,
      total: totalCount,
      page: filters.page,
      totalPages: Math.ceil(totalCount / filters.limit),
    };

    expect(result).toEqual(expectedResponse);
  });

  it('should get accounts by IDs', async () => {
    const mockedAccounts: Account[] = [
      {
        id: '1',
        name: 'test-account',
        type: 'Organization',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'test-account-2',
        type: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const ids: string[] = ['1', '2'];

    vi.mocked(dbClient.account.findMany).mockResolvedValue(mockedAccounts);

    const result = await accountRepository.getAccountsByIds(ids);

    expect(result).toEqual(mockedAccounts);
    expect(dbClient.account.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ids },
      },
    });
  });

  it('should delete an account', async () => {
    const accountId = '1';

    vi.mocked(dbClient.account.delete).mockResolvedValue({
      id: '1',
      name: 'test-account',
      type: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await accountRepository.deleteAccount(accountId);

    expect(dbClient.account.delete).toHaveBeenCalledWith({
      where: {
        id: accountId,
      },
    });
  });
});
