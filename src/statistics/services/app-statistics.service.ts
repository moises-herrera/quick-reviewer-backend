import { injectable, inject } from 'inversify';
import { PullRequestFiltersType } from '../../common/schemas/pull-request-filters.schema';
import { Metric } from '../../core/interfaces/metric';
import { PullRequestFiltersWithStateType } from '../../common/schemas/pull-request-filters-with-state.schema';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { ChartData } from '../../core/interfaces/chart-data';
import { PullRequestRepository } from 'src/core/repositories/pull-request.repository';
import { StatisticsService } from 'src/core/services/statistics.service';

@injectable()
export class AppStatisticsService implements StatisticsService {
  private readonly pullRequestAverageCreationCount =
    'Pull Request Average Count';
  private readonly pullRequestAverageCompletionTime =
    'Pull Request Average Completion Time';
  private readonly pullRequestInitialAverageTime =
    'Pull Request Initial Review Average Time';
  private readonly pullRequestAverageReviewCount =
    'Pull Request Average Review Count';

  constructor(
    @inject(PullRequestRepository)
    private pullRequestRepository: PullRequestRepository,
  ) {}

  async getPullRequestAverageCreationCountByRepository(
    filters: PullRequestFiltersType & UserBasicInfo,
  ): Promise<Metric> {
    const pullRequests =
      await this.pullRequestRepository.findPullRequestsForAverageCreationCount(
        filters,
      );

    if (pullRequests.length === 0) {
      return {
        name: this.pullRequestAverageCreationCount,
        value: 0,
        unit: 'pull requests',
      };
    }

    const total = pullRequests.length;

    return {
      name: this.pullRequestAverageCreationCount,
      value: total / filters.repositories.length,
      unit: 'pull requests',
    };
  }

  async getPullRequestAverageCompletionTime(
    filters: PullRequestFiltersType & UserBasicInfo,
  ): Promise<Metric> {
    const pullRequests =
      await this.pullRequestRepository.findPullRequestsForAverageCompletionTime(
        filters,
      );

    if (pullRequests.length === 0) {
      return {
        name: this.pullRequestAverageCompletionTime,
        value: 0,
        unit: 'hours',
      };
    }

    const completionTimes = pullRequests.map((pullRequest) => {
      const createdAt = pullRequest.createdAt.getTime();
      const closedAt = (pullRequest.closedAt as Date).getTime();
      return (closedAt - createdAt) / (1000 * 60 * 60);
    });

    const totalCompletionTime = completionTimes.reduce(
      (total, time) => total + time,
      0,
    );

    return {
      name: this.pullRequestAverageCompletionTime,
      value: totalCompletionTime / completionTimes.length,
      unit: 'hours',
    };
  }

  async getInitialReviewAverageTime(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<Metric> {
    const pullRequests =
      await this.pullRequestRepository.findPullRequestsForInitialReviewTime(
        filters,
      );

    if (pullRequests.length === 0) {
      return {
        name: this.pullRequestInitialAverageTime,
        value: 0,
        unit: 'hours',
      };
    }

    const initialReviewTimes = pullRequests.map((pullRequest) => {
      const createdAt = pullRequest.createdAt.getTime();
      const reviewSubmittedAt = (
        pullRequest.reviews[0]?.createdAt as Date
      )?.getTime();

      if (!reviewSubmittedAt) {
        return 0;
      }

      return (reviewSubmittedAt - createdAt) / (1000 * 60 * 60);
    });

    const totalInitialReviewTime = initialReviewTimes.reduce(
      (total, time) => total + time,
      0,
    );

    return {
      name: this.pullRequestInitialAverageTime,
      value: totalInitialReviewTime / initialReviewTimes.length,
      unit: 'hours',
    };
  }

  async getPullRequestAverageReviewCount(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<Metric> {
    const pullRequests =
      await this.pullRequestRepository.findPullRequestsForAverageReviewCount(
        filters,
      );

    if (pullRequests.length === 0) {
      return {
        name: this.pullRequestAverageReviewCount,
        value: 0,
        unit: 'reviews',
      };
    }

    const reviewCounts = pullRequests.map(({ reviews }) => reviews.length);

    const totalReviewCount = reviewCounts.reduce(
      (total, count) => total + count,
      0,
    );

    return {
      name: this.pullRequestAverageReviewCount,
      value: totalReviewCount / reviewCounts.length,
      unit: 'reviews',
    };
  }

  async getPullRequestReviewCountByRepository(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<ChartData> {
    const pullRequests =
      await this.pullRequestRepository.findPullRequestsForReviewCountByRepository(
        filters,
      );

    const reviewCountsByRepository: Record<string, number[]> = {};
    pullRequests.forEach(({ repository, reviews }) => {
      const repositoryKey = `${repository.owner.name}/${repository.name}`;

      if (!reviewCountsByRepository[repositoryKey]) {
        reviewCountsByRepository[repositoryKey] = [];
      }
      reviewCountsByRepository[repositoryKey].push(reviews.length);
    });

    const reviewCounts = Object.entries(reviewCountsByRepository).map(
      ([repositoryKey, reviewCounts]) => {
        const totalReviews = reviewCounts.reduce(
          (total, count) => total + count,
          0,
        );
        return {
          label: repositoryKey,
          value: totalReviews,
        };
      },
    );

    return {
      title: 'Review Count by Repository',
      data: reviewCounts,
    };
  }

  async getPullRequestCountByRepository(
    filters: PullRequestFiltersWithStateType & UserBasicInfo,
  ): Promise<ChartData> {
    const pullRequests =
      await this.pullRequestRepository.findPullRequestsForCountByRepository(
        filters,
      );

    const pullRequestCountsByRepository: Record<string, number> = {};

    pullRequests.forEach(({ repository }) => {
      const repositoryKey = `${repository.owner.name}/${repository.name}`;

      if (!pullRequestCountsByRepository[repositoryKey]) {
        pullRequestCountsByRepository[repositoryKey] = 0;
      }
      pullRequestCountsByRepository[repositoryKey]++;
    });

    const pullRequestCounts = Object.entries(pullRequestCountsByRepository).map(
      ([repositoryKey, count]) => ({
        label: repositoryKey,
        value: count,
      }),
    );

    return {
      title: 'Pull Request Count by Repository',
      data: pullRequestCounts,
    };
  }
}
