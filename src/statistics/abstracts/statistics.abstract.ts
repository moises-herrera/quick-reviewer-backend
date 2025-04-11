import { injectable } from 'inversify';
import { Metric } from 'src/statistics/interfaces/metric';
import { ChartData } from '../interfaces/chart-data';
import { PullRequestAuthFilters } from 'src/common/interfaces/pull-request-auth-filters';
import { PullRequestAuthFiltersWithState } from 'src/common/interfaces/pull-request-auth-filters-with-state';

@injectable()
export abstract class StatisticsService {
  abstract getPullRequestAverageCreationCountByRepository(
    filters: PullRequestAuthFilters,
  ): Promise<Metric>;
  abstract getPullRequestAverageCompletionTime(
    filters: PullRequestAuthFilters,
  ): Promise<Metric>;
  abstract getInitialReviewAverageTime(
    filters: PullRequestAuthFiltersWithState,
  ): Promise<Metric>;
  abstract getPullRequestAverageReviewCount(
    filters: PullRequestAuthFiltersWithState,
  ): Promise<Metric>;
  abstract getPullRequestReviewCountByRepository(
    filters: PullRequestAuthFiltersWithState,
  ): Promise<ChartData>;
  abstract getPullRequestCountByRepository(
    filters: PullRequestAuthFiltersWithState,
  ): Promise<ChartData>;
}
