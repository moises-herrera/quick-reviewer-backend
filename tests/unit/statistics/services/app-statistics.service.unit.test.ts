import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { EntityId } from 'src/common/interfaces/entity-id';
import { PullRequestAuthFilters } from 'src/common/interfaces/pull-request-auth-filters';
import { PullRequestAverageCompletionTimeData } from 'src/common/interfaces/pull-request-average-completion-time-data';
import { PullRequestAverageReviewCountData } from 'src/common/interfaces/pull-request-average-review-count-data';
import { PullRequestCountByRepositoryData } from 'src/common/interfaces/pull-request-count-by-repository-data';
import { PullRequestInitialReviewTimeData } from 'src/common/interfaces/pull-request-initial-review-time-data';
import { PullRequestReviewCountData } from 'src/common/interfaces/pull-request-review-count-data';
import { ChartData } from 'src/statistics/interfaces/chart-data';
import { Metric } from 'src/statistics/interfaces/metric';
import { AppStatisticsService } from 'src/statistics/services/app-statistics.service';
import { MockPullRequestRepository } from 'tests/mocks/repositories/mock-pull-request.repository';

describe('AppStatisticsService', () => {
  let service: AppStatisticsService;
  let pullRequestRepository: PullRequestRepository;
  const filters: PullRequestAuthFilters = {
    repositories: ['repo1', 'repo2', 'repo3'],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-01-01'),
    userId: 'user1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    pullRequestRepository = new MockPullRequestRepository();
    service = new AppStatisticsService(pullRequestRepository);
  });

  describe('getPullRequestAverageCreationCountByRepository', () => {
    it('should return the average creation count of pull requests by repository', async () => {
      const pullRequestsData: EntityId[] = [
        {
          id: '1',
        },
        {
          id: '2',
        },
      ];
      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForAverageCreationCount')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Average Count',
        value: pullRequestsData.length / filters.repositories.length,
        unit: 'pull requests',
      };

      const result =
        await service.getPullRequestAverageCreationCountByRepository(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should return 0 if no pull requests are found', async () => {
      const pullRequestsData: EntityId[] = [];
      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForAverageCreationCount')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Average Count',
        value: 0,
        unit: 'pull requests',
      };

      const result =
        await service.getPullRequestAverageCreationCountByRepository(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPullRequestAverageCompletionTime', () => {
    it('should return the average completion time of pull requests', async () => {
      const pullRequestsData: PullRequestAverageCompletionTimeData[] = [
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          closedAt: new Date('2024-01-01T01:00:00Z'),
        },
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          closedAt: new Date('2024-01-01T02:00:00Z'),
        },
      ];
      const spyFindPullRequests = vi
        .spyOn(
          pullRequestRepository,
          'findPullRequestsForAverageCompletionTime',
        )
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Average Completion Time',
        value: 5400,
        unit: 'seconds',
      };

      const result = await service.getPullRequestAverageCompletionTime(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should return 0 if no pull requests are found', async () => {
      const pullRequestsData: PullRequestAverageCompletionTimeData[] = [];
      const spyFindPullRequests = vi
        .spyOn(
          pullRequestRepository,
          'findPullRequestsForAverageCompletionTime',
        )
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Average Completion Time',
        value: 0,
        unit: 'seconds',
      };

      const result = await service.getPullRequestAverageCompletionTime(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getInitialReviewAverageTime', () => {
    it('should return the initial review average time of pull requests', async () => {
      const pullRequestsData: PullRequestInitialReviewTimeData[] = [
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          reviews: [
            {
              createdAt: new Date('2024-01-01T00:30:00Z'),
            },
          ],
        },
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          reviews: [
            {
              createdAt: new Date('2024-01-01T01:00:00Z'),
            },
          ],
        },
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          reviews: [
            {
              createdAt: new Date('2024-01-01T02:00:00Z'),
            },
          ],
        },
      ];
      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForInitialReviewTime')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Initial Review Average Time',
        value: 4200,
        unit: 'seconds',
      };

      const result = await service.getInitialReviewAverageTime(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should return 0 if no pull requests are found', async () => {
      const pullRequestsData: PullRequestInitialReviewTimeData[] = [];
      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForInitialReviewTime')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Initial Review Average Time',
        value: 0,
        unit: 'seconds',
      };

      const result = await service.getInitialReviewAverageTime(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should return 0 if no reviews are found', async () => {
      const pullRequestsData: PullRequestInitialReviewTimeData[] = [
        {
          createdAt: new Date('2024-01-01T00:00:00Z'),
          reviews: [],
        },
      ];
      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForInitialReviewTime')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Initial Review Average Time',
        value: 0,
        unit: 'seconds',
      };

      const result = await service.getInitialReviewAverageTime(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPullRequestAverageReviewCount', () => {
    it('should return the average review count of pull requests', async () => {
      const pullRequestsData: PullRequestAverageReviewCountData[] = [
        {
          reviews: [
            {
              id: '1',
            },
            {
              id: '2',
            },
          ],
        },
        {
          reviews: [
            {
              id: '3',
            },
          ],
        },
        {
          reviews: [
            {
              id: '4',
            },
            {
              id: '5',
            },
            {
              id: '6',
            },
          ],
        },
      ];
      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForAverageReviewCount')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Average Review Count',
        value: 2,
        unit: 'reviews',
      };

      const result = await service.getPullRequestAverageReviewCount(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });

    it('should return 0 if no pull requests are found', async () => {
      const pullRequestsData: PullRequestAverageReviewCountData[] = [];
      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForAverageReviewCount')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: Metric = {
        name: 'Pull Request Average Review Count',
        value: 0,
        unit: 'reviews',
      };

      const result = await service.getPullRequestAverageReviewCount(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPullRequestReviewCountByRepository', () => {
    it('should return the review count of pull requests by repository', async () => {
      const pullRequestsData: PullRequestReviewCountData[] = [
        {
          repositoryId: '1',
          repository: {
            name: 'repo1',
            owner: {
              name: 'owner1',
            },
          },
          reviews: [
            {
              id: '1',
            },
            {
              id: '2',
            },
          ],
        },
        {
          repositoryId: '2',
          repository: {
            name: 'repo2',
            owner: {
              name: 'owner1',
            },
          },
          reviews: [
            {
              id: '3',
            },
          ],
        },
        {
          repositoryId: '3',
          repository: {
            name: 'repo3',
            owner: {
              name: 'owner1',
            },
          },
          reviews: [
            {
              id: '4',
            },
            {
              id: '5',
            },
            {
              id: '6',
            },
          ],
        },
      ];
      const spyFindPullRequests = vi
        .spyOn(
          pullRequestRepository,
          'findPullRequestsForReviewCountByRepository',
        )
        .mockResolvedValue(pullRequestsData);

      const expectedResult: ChartData = {
        title: 'Review Count by Repository',
        data: [
          {
            label: 'owner1/repo1',
            value: 2,
          },
          {
            label: 'owner1/repo2',
            value: 1,
          },
          {
            label: 'owner1/repo3',
            value: 3,
          },
        ],
      };

      const result =
        await service.getPullRequestReviewCountByRepository(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPullRequestCountByRepository', () => {
    it('should return the count of pull requests by repository', async () => {
      const pullRequestsData: PullRequestCountByRepositoryData[] = [
        {
          repositoryId: '1',
          repository: {
            name: 'repo1',
            owner: {
              name: 'owner1',
            },
          },
        },
        {
          repositoryId: '1',
          repository: {
            name: 'repo1',
            owner: {
              name: 'owner1',
            },
          },
        },
        {
          repositoryId: '2',
          repository: {
            name: 'repo2',
            owner: {
              name: 'owner1',
            },
          },
        },
        {
          repositoryId: '3',
          repository: {
            name: 'repo3',
            owner: {
              name: 'owner1',
            },
          },
        },
      ];

      const spyFindPullRequests = vi
        .spyOn(pullRequestRepository, 'findPullRequestsForCountByRepository')
        .mockResolvedValue(pullRequestsData);

      const expectedResult: ChartData = {
        title: 'Pull Request Count by Repository',
        data: [
          {
            label: 'owner1/repo1',
            value: 2,
          },
          {
            label: 'owner1/repo2',
            value: 1,
          },
          {
            label: 'owner1/repo3',
            value: 1,
          },
        ],
      };

      const result = await service.getPullRequestCountByRepository(filters);

      expect(spyFindPullRequests).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expectedResult);
    });
  });
});
