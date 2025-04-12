import { PullRequest, Repository } from '@prisma/client';
import { HttpException } from 'src/common/exceptions/http-exception';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersWithStateType } from 'src/common/schemas/pull-request-filters-with-state.schema';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { DbClient } from 'src/common/database/db-client';
import { PostgresPullRequestRepository } from 'src/common/database/repositories/postgres-pull-request.repository';
import { MockDbClient } from 'tests/mocks/repositories/mock-db-client';

describe('PostgresPullRequestRepository', () => {
  let repository: PostgresPullRequestRepository;
  let dbClient: DbClient;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    repository = new PostgresPullRequestRepository(dbClient);
  });

  describe('savePullRequest', () => {
    it('should save a pull request', async () => {
      // Arrange
      const pullRequest: Partial<PullRequest> = {
        id: '1',
        title: 'Test PR',
        nodeId: 'node1',
        repositoryId: 'repo1',
      };
      vi.mocked(dbClient.pullRequest.create).mockResolvedValue(
        pullRequest as PullRequest,
      );

      // Act
      await repository.savePullRequest(pullRequest as PullRequest);

      // Assert
      expect(dbClient.pullRequest.create).toHaveBeenCalledWith({
        data: pullRequest,
      });
    });
  });

  describe('savePullRequests', () => {
    it('should save multiple pull requests', async () => {
      // Arrange
      const pullRequests: Partial<PullRequest>[] = [
        { id: '1', title: 'PR 1', repositoryId: 'repo1' },
        { id: '2', title: 'PR 2', repositoryId: 'repo1' },
      ];
      vi.mocked(dbClient.pullRequest.createMany).mockResolvedValue({
        count: pullRequests.length,
      });

      // Act
      await repository.savePullRequests(pullRequests as PullRequest[]);

      // Assert
      expect(dbClient.pullRequest.createMany).toHaveBeenCalledWith({
        data: pullRequests,
      });
    });
  });

  describe('getPullRequestById', () => {
    it('should return a pull request by ID', async () => {
      // Arrange
      const pullRequestId = '1';
      const mockPR: Partial<PullRequest> = {
        id: pullRequestId,
        title: 'Test PR',
        nodeId: 'node1',
      };
      vi.mocked(dbClient.pullRequest.findFirst).mockResolvedValue(
        mockPR as PullRequest,
      );

      // Act
      const result = await repository.getPullRequestById(pullRequestId);

      // Assert
      expect(dbClient.pullRequest.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ id: pullRequestId }, { nodeId: pullRequestId }],
        },
      });
      expect(result).toEqual(mockPR);
    });
  });

  describe('updatePullRequest', () => {
    it('should update a pull request', async () => {
      // Arrange
      const pullRequestId = '1';
      const updateData: Partial<PullRequest> = { title: 'Updated Title' };
      vi.mocked(dbClient.pullRequest.update).mockResolvedValue(
        {} as PullRequest,
      );

      // Act
      await repository.updatePullRequest(pullRequestId, updateData);

      // Assert
      expect(dbClient.pullRequest.update).toHaveBeenCalledWith({
        where: { id: pullRequestId },
        data: updateData,
      });
    });
  });

  describe('getPullRequests', () => {
    it('should return paginated pull requests when using repository name', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        search: '',
        userId: 'user1',
        repositoryName: 'repo-name',
        ownerName: 'owner-name',
      };

      const mockRepo: Repository = {
        id: 'repo-id',
        name: 'repo-name',
        ownerId: 'owner-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPRs = [
        { id: '1', title: 'PR 1' },
        { id: '2', title: 'PR 2' },
      ];

      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue(
        mockPRs as PullRequest[],
      );
      vi.mocked(dbClient.pullRequest.count).mockResolvedValue(2);
      vi.mocked(dbClient.repository.findFirst).mockResolvedValue(mockRepo);

      // Act
      const result = await repository.getPullRequests(options);

      // Assert
      expect(dbClient.repository.findFirst).toHaveBeenCalledWith({
        where: {
          name: options.repositoryName,
          owner: {
            name: options.ownerName,
          },
          users: {
            some: {
              userId: options.userId,
            },
          },
        },
      });

      expect(dbClient.pullRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            repository: {
              id: mockRepo.id,
            },
            title: {
              contains: options.search,
              mode: 'insensitive',
            },
          },
          take: options.limit,
          skip: 0,
          orderBy: {
            createdAt: 'desc',
          },
        }),
      );

      expect(result).toEqual({
        data: mockPRs,
        total: 2,
        page: 1,
        totalPages: 1,
      });
    });

    it('should return paginated pull requests when using repository ID', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        search: '',
        userId: 'user1',
        repositoryName: '123',
        ownerName: 'owner-name',
      };

      const mockRepo: Repository = {
        id: 'repo-id',
        name: 'repo-name',
        ownerId: 'owner-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(dbClient.repository.findFirst).mockResolvedValue(mockRepo);
      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue([]);
      vi.mocked(dbClient.pullRequest.count).mockResolvedValue(0);

      // Act
      const result = await repository.getPullRequests(options);

      // Assert
      expect(dbClient.repository.findFirst).toHaveBeenCalledWith({
        where: {
          id: options.repositoryName,
          users: {
            some: {
              userId: options.userId,
            },
          },
        },
      });
      expect(result.total).toEqual(0);
    });

    it('should throw an error when repository is not found', async () => {
      // Arrange
      const options = {
        page: 1,
        limit: 10,
        search: '',
        userId: 'user1',
        repositoryName: 'non-existent',
        ownerName: 'owner-name',
      };

      vi.mocked(dbClient.repository.findFirst).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.getPullRequests(options)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findPullRequestsForAverageCreationCount', () => {
    it('should find pull requests for average creation count', async () => {
      // Arrange
      const filters: PullRequestFiltersType & UserBasicInfo = {
        userId: 'user1',
        repositories: ['repo1', 'repo2'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const mockPRs = [{ id: '1' }, { id: '2' }];
      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue(
        mockPRs as unknown as PullRequest[],
      );

      // Act
      const result =
        await repository.findPullRequestsForAverageCreationCount(filters);

      // Assert
      expect(dbClient.pullRequest.findMany).toHaveBeenCalledWith({
        where: {
          repositoryId: {
            in: filters.repositories,
          },
          repository: {
            users: {
              some: {
                userId: filters.userId,
              },
            },
          },
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        },
        select: {
          id: true,
        },
      });
      expect(result).toEqual(mockPRs);
    });
  });

  describe('findPullRequestsForAverageCompletionTime', () => {
    it('should find pull requests for average completion time', async () => {
      // Arrange
      const filters: PullRequestFiltersType & UserBasicInfo = {
        userId: 'user1',
        repositories: ['repo1', 'repo2'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const mockPRs = [
        { createdAt: new Date('2023-01-15'), closedAt: new Date('2023-01-20') },
      ];
      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue(
        mockPRs as unknown as PullRequest[],
      );

      // Act
      const result =
        await repository.findPullRequestsForAverageCompletionTime(filters);

      // Assert
      expect(dbClient.pullRequest.findMany).toHaveBeenCalledWith({
        where: {
          repositoryId: {
            in: filters.repositories,
          },
          repository: {
            users: {
              some: {
                userId: filters.userId,
              },
            },
          },
          state: 'closed',
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
          mergedAt: {
            not: null,
          },
        },
        select: {
          createdAt: true,
          closedAt: true,
        },
      });
      expect(result).toEqual(mockPRs);
    });
  });

  describe('findPullRequestsForInitialReviewTime', () => {
    it('should find pull requests for initial review time', async () => {
      // Arrange
      const filters: PullRequestFiltersWithStateType & UserBasicInfo = {
        userId: 'user1',
        status: 'open',
        repositories: ['repo1', 'repo2'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const mockPRs = [
        {
          createdAt: new Date('2023-01-15'),
          closedAt: null,
          reviews: [{ createdAt: new Date('2023-01-16') }],
        },
      ];
      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue(
        mockPRs as unknown as PullRequest[],
      );

      // Act
      const result =
        await repository.findPullRequestsForInitialReviewTime(filters);

      // Assert
      expect(dbClient.pullRequest.findMany).toHaveBeenCalledWith({
        where: {
          repositoryId: {
            in: filters.repositories,
          },
          repository: {
            users: {
              some: {
                userId: filters.userId,
              },
            },
          },
          state: filters.status,
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
          reviews: {
            some: {
              id: {
                not: undefined,
              },
            },
          },
        },
        select: {
          createdAt: true,
          reviews: {
            select: {
              createdAt: true,
            },
          },
        },
      });
      expect(result).toEqual(mockPRs);
    });
  });

  describe('findPullRequestsForAverageReviewCount', () => {
    it('should find pull requests for average review count', async () => {
      // Arrange
      const filters: PullRequestFiltersWithStateType & UserBasicInfo = {
        userId: 'user1',
        repositories: ['repo1', 'repo2'],
        status: 'closed',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const mockPRs = [
        { reviews: [{ id: '1' }, { id: '2' }] },
        { reviews: [{ id: '3' }] },
      ];
      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue(
        mockPRs as unknown as PullRequest[],
      );

      // Act
      const result =
        await repository.findPullRequestsForAverageReviewCount(filters);

      // Assert
      expect(dbClient.pullRequest.findMany).toHaveBeenCalledWith({
        where: {
          repositoryId: {
            in: filters.repositories,
          },
          repository: {
            users: {
              some: {
                userId: filters.userId,
              },
            },
          },
          state: filters.status,
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        },
        select: {
          reviews: {
            select: {
              id: true,
            },
          },
        },
      });
      expect(result).toEqual(mockPRs);
    });
  });

  describe('findPullRequestsForReviewCountByRepository', () => {
    it('should find pull requests for review count by repository', async () => {
      // Arrange
      const filters: PullRequestFiltersWithStateType & UserBasicInfo = {
        userId: 'user1',
        repositories: ['repo1', 'repo2'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const mockPRs = [
        {
          repositoryId: 'repo1',
          repository: { name: 'Repo 1', owner: { name: 'Owner' } },
          reviews: [{ id: '1' }],
        },
      ];
      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue(
        mockPRs as unknown as PullRequest[],
      );

      // Act
      const result =
        await repository.findPullRequestsForReviewCountByRepository(filters);

      // Assert
      expect(dbClient.pullRequest.findMany).toHaveBeenCalledWith({
        where: {
          repositoryId: {
            in: filters.repositories,
          },
          repository: {
            users: {
              some: {
                userId: filters.userId,
              },
            },
          },
          state: filters.status,
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        },
        select: {
          repositoryId: true,
          repository: {
            select: {
              name: true,
              owner: {
                select: {
                  name: true,
                },
              },
            },
          },
          reviews: {
            select: {
              id: true,
            },
          },
        },
      });
      expect(result).toEqual(mockPRs);
    });
  });

  describe('findPullRequestsForCountByRepository', () => {
    it('should find pull requests for count by repository', async () => {
      // Arrange
      const filters: PullRequestFiltersType & UserBasicInfo = {
        userId: 'user1',
        repositories: ['repo1', 'repo2'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      };

      const mockPRs = [
        {
          repositoryId: 'repo1',
          repository: { name: 'Repo 1', owner: { name: 'Owner' } },
        },
      ];
      vi.mocked(dbClient.pullRequest.findMany).mockResolvedValue(
        mockPRs as unknown as PullRequest[],
      );

      // Act
      const result =
        await repository.findPullRequestsForCountByRepository(filters);

      // Assert
      expect(dbClient.pullRequest.findMany).toHaveBeenCalledWith({
        where: {
          repositoryId: {
            in: filters.repositories,
          },
          repository: {
            users: {
              some: {
                userId: filters.userId,
              },
            },
          },
          createdAt: {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
          },
        },
        select: {
          repositoryId: true,
          repository: {
            select: {
              name: true,
              owner: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockPRs);
    });
  });
});
