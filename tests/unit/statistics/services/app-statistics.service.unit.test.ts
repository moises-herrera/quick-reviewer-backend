import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { EntityId } from 'src/common/interfaces/entity-id';
import { PullRequestAuthFilters } from 'src/common/interfaces/pull-request-auth-filters';
import { Metric } from 'src/statistics/interfaces/metric';
import { AppStatisticsService } from 'src/statistics/services/app-statistics.service';
import { MockPullRequestRepository } from 'tests/mocks/mock-pull-request.repository';

describe('AppStatisticsService', () => {
  let service: AppStatisticsService;
  let pullRequestRepository: PullRequestRepository;

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

      const filters: PullRequestAuthFilters = {
        repositories: ['repo1', 'repo2', 'repo3'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        userId: 'user1',
      };

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

      const filters: PullRequestAuthFilters = {
        repositories: ['repo1', 'repo2', 'repo3'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
        userId: 'user1',
      };

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
});
