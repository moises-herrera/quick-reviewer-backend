import { injectable } from 'inversify';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { PullRequestFiltersWithStateType } from 'src/common/schemas/pull-request-filters-with-state.schema';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { Metric } from 'src/core/interfaces/metric';
import { ChartData } from '../interfaces/chart-data';

@injectable()
export abstract class StatisticsService {
  abstract getPullRequestAverageCreationCountByRepository(
    filters: PullRequestFiltersType & UserBasicInfo,
  ): Promise<Metric>;
  abstract getPullRequestAverageCompletionTime(
    filters: PullRequestFiltersType & UserBasicInfo,
  ): Promise<Metric>;
  abstract getInitialReviewAverageTime(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<Metric>;
  abstract getPullRequestAverageReviewCount(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<Metric>;
  abstract getPullRequestReviewCountByRepository(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<ChartData>;
  abstract getPullRequestCountByRepository(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<ChartData>;
}
