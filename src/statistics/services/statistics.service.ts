import { prisma } from 'src/database/db-connection';
import { PullRequestAverageCompletionTime } from '../schemas/pull-request-filters.schema';
import { Metric } from '../interfaces/metric';
import { PullRequestInitialAverageTime } from '../schemas/pull-request-filters-with-state.schema';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { ChartData } from '../interfaces/chart-data';

export class StatisticsService {
  private readonly pullRequestAverageCreationCount =
    'Pull Request Average Count';
  private readonly pullRequestAverageCompletionTime =
    'Pull Request Average Completion Time';
  private readonly pullRequestInitialAverageTime =
    'Pull Request Initial Review Average Time';
  private readonly pullRequestAverageReviewCount =
    'Pull Request Average Review Count';

  async getPullRequestAverageCreationCountByRepository({
    userId,
    repositories,
    startDate,
    endDate,
  }: PullRequestAverageCompletionTime & UserBasicInfo): Promise<Metric> {
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      select: {
        createdAt: true,
        closedAt: true,
      },
    });

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
      value: total / repositories.length,
      unit: 'pull requests',
    };
  }

  async getPullRequestAverageCompletionTime({
    userId,
    repositories,
    startDate,
    endDate,
  }: PullRequestAverageCompletionTime & UserBasicInfo): Promise<Metric> {
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: 'closed',
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
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

  async getInitialReviewAverageTime({
    userId,
    repositories,
    status,
    startDate,
    endDate,
  }: PullRequestInitialAverageTime & UserBasicInfo): Promise<Metric> {
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: status,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
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
        closedAt: true,
        reviews: {
          select: {
            createdAt: true,
          },
        },
      },
    });

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

  async getAverageReviewCount({
    userId,
    repositories,
    status,
    startDate,
    endDate,
  }: PullRequestInitialAverageTime & UserBasicInfo): Promise<Metric> {
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: status,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
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

  async getPullRequestReviewCountByRepository({
    userId,
    repositories,
    status,
    startDate,
    endDate,
  }: PullRequestInitialAverageTime & UserBasicInfo): Promise<ChartData> {
    // Get all pull requests grouped by repositoryId and count the number of reviews for each pull request.
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        state: status,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
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

  async getPullRequestCountByRepository({
    userId,
    repositories,
    startDate,
    endDate,
  }: PullRequestInitialAverageTime & UserBasicInfo): Promise<ChartData> {
    const pullRequests = await prisma.pullRequest.findMany({
      where: {
        repositoryId: {
          in: repositories,
        },
        repository: {
          users: {
            some: {
              userId,
            },
          },
        },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
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
