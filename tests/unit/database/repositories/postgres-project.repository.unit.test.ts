import { Account, Repository } from '@prisma/client';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from 'src/github/interfaces/record-filters';
import { DbClient } from 'src/common/database/db-client';
import { PostgresProjectRepository } from 'src/common/database/repositories/postgres-project.repository';
import { container } from 'src/app/config/container-config';

vi.mock('src/common/database/db-client', () => ({
  DbClient: vi.fn().mockImplementation(() => ({
    account: {
      findFirst: vi.fn(),
    },
    repository: {
      createMany: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      delete: vi.fn(),
    },
  })),
}));

describe('PostgresProjectRepository', () => {
  let dbClient: DbClient;
  let projectRepository: PostgresProjectRepository;

  beforeEach(() => {
    dbClient = container.get(DbClient);
    projectRepository = new PostgresProjectRepository(dbClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should save a repository', async () => {
    const repository: Repository = {
      id: '1',
      name: 'repo1',
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(dbClient.repository.create).mockResolvedValue(repository);

    const result = await projectRepository.saveRepository(repository);

    expect(dbClient.repository.create).toHaveBeenCalledWith({
      data: repository,
    });
    expect(result).toEqual(repository);
  });

  it('should save multiple repositories', async () => {
    const repositories: Repository[] = [
      {
        id: '1',
        name: 'repo1',
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'repo2',
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await projectRepository.saveRepositories(repositories);

    expect(dbClient.repository.createMany).toHaveBeenCalledWith({
      data: repositories,
    });
  });

  describe('Get repositories', () => {
    it('should get paginated repositories', async () => {
      const options: RepositoryFilters = {
        ownerName: 'owner1',
        userId: 'user1',
        search: '',
        page: 1,
        limit: 10,
      };

      const repositories: Repository[] = [
        {
          id: '1',
          name: 'repo1',
          ownerId: 'owner1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const total = repositories.length;

      const expectedResponse: PaginatedResponse<Repository> = {
        data: repositories,
        total,
        page: options.page,
        totalPages: Math.ceil(total / options.limit),
      };

      const account: Account = {
        id: 'owner1',
        name: 'owner1',
        type: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(dbClient.account.findFirst).mockResolvedValue(account);
      vi.mocked(dbClient.repository.findMany).mockResolvedValue(repositories);
      vi.mocked(dbClient.repository.count).mockResolvedValue(total);

      const result = await projectRepository.getPaginatedRepositories(options);

      expect(dbClient.repository.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: options.search,
          },
          users: {
            some: {
              userId: options.userId,
            },
          },
          ownerId: 'owner1',
        },
        take: options.limit,
        skip: 0,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(dbClient.repository.count).toHaveBeenCalledWith({
        where: {
          name: {
            contains: options.search,
          },
          users: {
            some: {
              userId: options.userId,
            },
          },
          owner: {
            name: options.ownerName,
          },
        },
      });

      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if account is not found', async () => {
      const options: RepositoryFilters = {
        ownerName: 'owner1',
        userId: 'user1',
        search: '',
        page: 1,
        limit: 10,
      };

      vi.mocked(dbClient.account.findFirst).mockResolvedValue(null);

      await expect(
        projectRepository.getPaginatedRepositories(options),
      ).rejects.toThrow('Account not found');

      expect(dbClient.account.findFirst).toHaveBeenCalledWith({
        where: {
          name: options.ownerName,
          users: {
            some: {
              userId: options.userId,
            },
          },
        },
      });
    });

    it('should get repositories by IDs', async () => {
      const repositoryIds = ['1', '2'];
      const repositories: Repository[] = [
        {
          id: '1',
          name: 'repo1',
          ownerId: 'owner1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'repo2',
          ownerId: 'owner1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(dbClient.repository.findMany).mockResolvedValue(repositories);

      const result =
        await projectRepository.getRepositoriesByIds(repositoryIds);

      expect(dbClient.repository.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: repositoryIds,
          },
        },
      });
      expect(result).toEqual(repositories);
    });
  });

  it('should rename a repository', async () => {
    const repositoryId = '1';
    const newName = 'newRepoName';

    const updatedRepository: Repository = {
      id: repositoryId,
      name: newName,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(dbClient.repository.update).mockResolvedValue(updatedRepository);

    const result = await projectRepository.renameRepository(
      repositoryId,
      newName,
    );

    expect(dbClient.repository.update).toHaveBeenCalledWith({
      where: {
        id: repositoryId,
      },
      data: {
        name: newName,
      },
    });
    expect(result).toEqual(updatedRepository);
  });

  it('should delete a repository by ID', async () => {
    const repositoryId = '1';

    await projectRepository.deleteRepository(repositoryId);

    expect(dbClient.repository.delete).toHaveBeenCalledWith({
      where: {
        id: repositoryId,
      },
    });
  });

  it('should delete multiple repositories by IDs', async () => {
    const repositoryIds = ['1', '2'];

    await projectRepository.deleteRepositories(repositoryIds);

    expect(dbClient.repository.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: repositoryIds,
        },
      },
    });
  });

  it('should throw an error if repository not found', async () => {
    const repositoryId = '1';

    vi.mocked(dbClient.repository.delete).mockRejectedValue(
      new Error('Not found'),
    );

    await expect(
      projectRepository.deleteRepository(repositoryId),
    ).rejects.toThrow('Not found');

    expect(dbClient.repository.delete).toHaveBeenCalledWith({
      where: {
        id: repositoryId,
      },
    });
  });

  it('should throw an error if repositories not found', async () => {
    const repositoryIds = ['1', '2'];

    vi.mocked(dbClient.repository.deleteMany).mockRejectedValue(
      new Error('Not found'),
    );

    await expect(
      projectRepository.deleteRepositories(repositoryIds),
    ).rejects.toThrow('Not found');

    expect(dbClient.repository.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: repositoryIds,
        },
      },
    });
  });
});
