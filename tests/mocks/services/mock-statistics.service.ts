import { PullRequestAuthFilters } from 'src/common/interfaces/pull-request-auth-filters';
import { PullRequestAuthFiltersWithState } from 'src/common/interfaces/pull-request-auth-filters-with-state';
import { StatisticsService } from 'src/statistics/abstracts/statistics.abstract';
import { ChartData } from 'src/statistics/interfaces/chart-data';
import { Metric } from 'src/statistics/interfaces/metric';

export class MockStatisticsService implements StatisticsService {
  getPullRequestAverageCreationCountByRepository = vi.fn(
    (filters: PullRequestAuthFilters): Promise<Metric> => {
      return Promise.resolve({
        name: 'Pull Request Average Count',
        value: 0,
        unit: 'pull requests',
      });
    },
  );

  getPullRequestAverageCompletionTime = vi.fn(
    (filters: PullRequestAuthFilters): Promise<Metric> => {
      return Promise.resolve({
        name: 'Pull Request Average Completion Time',
        value: 0,
        unit: 'seconds',
      });
    },
  );

  getInitialReviewAverageTime = vi.fn(
    (filters: PullRequestAuthFiltersWithState): Promise<Metric> => {
      return Promise.resolve({
        name: 'Pull Request Initial Review Average Time',
        value: 0,
        unit: 'seconds',
      });
    },
  );

  getPullRequestAverageReviewCount = vi.fn(
    (filters: PullRequestAuthFiltersWithState): Promise<Metric> => {
      return Promise.resolve({
        name: 'Pull Request Average Review Count',
        value: 0,
        unit: 'pull requests',
      });
    },
  );

  getPullRequestReviewCountByRepository = vi.fn(
    (filters: PullRequestAuthFiltersWithState): Promise<ChartData> => {
      return Promise.resolve({
        title: 'Review Count by Repository',
        data: [
          { label: 'Repository 1', value: 0 },
          { label: 'Repository 2', value: 0 },
        ],
      });
    },
  );

  getPullRequestCountByRepository = vi.fn(
    (filters: PullRequestAuthFiltersWithState): Promise<ChartData> => {
      return Promise.resolve({
        title: 'Pull Request Count by Repository',
        data: [
          { label: 'Repository 1', value: 0 },
          { label: 'Repository 2', value: 0 },
        ],
      });
    },
  );
}
