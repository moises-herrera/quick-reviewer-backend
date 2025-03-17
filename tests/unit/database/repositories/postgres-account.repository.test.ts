import { Account, Repository } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { AccountFilters } from 'src/core/interfaces/record-filters';
import { DbClient } from 'src/database/db-client';
import { PostgresAccountRepository } from 'src/database/repositories/postgres-account.repository';

vi.mock('src/database/db-client', () => ({
  DbClient: vi.fn().mockImplementation(() => ({
    account: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
  })),
}));

describe('PostgresAccountRepository', () => {
  let accountRepository: PostgresAccountRepository;
  let dbClient: DbClient;

  const filters: AccountFilters = {
    page: 1,
    limit: 10,
    search: 'test',
    userId: 1,
  };

  beforeEach(() => {
    dbClient = new DbClient();
    accountRepository = new PostgresAccountRepository(dbClient);
  });

  it('should create a new account with repositories', async () => {
    const accountData: Account & { repositories: Repository[] } = {
      id: 1n,
      name: 'test-account',
      type: 'User',
      repositories: [
        {
          id: 1n,
          name: 'test-repo',
          ownerId: 1n,
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
  });

  it('should get paginated accounts', async () => {
    const mockedAccounts: Account[] = [
      {
        id: 1n,
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
        id: 1n,
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
        id: 1n,
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
        id: 1n,
        name: 'test-account',
        type: 'Organization',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(dbClient.account.findMany).mockResolvedValue(mockedAccounts);

    const result = await accountRepository.getAccountsByIds([1]);

    expect(result).toEqual(mockedAccounts);
  });

  it('should delete an account', async () => {
    const accountId = 1;

    vi.mocked(dbClient.account.delete).mockResolvedValue({
      id: 1n,
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
