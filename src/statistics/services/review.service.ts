import { PaginationOptions } from 'src/common/interfaces/pagination-options';
import { PullRequestAverageCompletionTime } from '../schemas/pull-request-average-completion-time.schema';
import { UserBasicInfo } from 'src/common/interfaces/user-basic-info';
import { prisma } from 'src/database/db-connection';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { ReviewInfo } from '../interfaces/review-info';

export class ReviewService {
  async getPullRequestReviews({
    userId,
    repositories,
    startDate,
    endDate,
    page,
    limit,
  }: PullRequestAverageCompletionTime &
    PaginationOptions &
    UserBasicInfo): Promise<PaginatedResponse<ReviewInfo>> {
    const filter = {
      pullRequest: {
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
      },
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };
    const reviews = await prisma.codeReview.findMany({
      where: filter,
      select: {
        id: true,
        createdAt: true,
        reviewer: true,
        status: true,
        pullRequest: {
          select: {
            id: true,
            number: true,
            title: true,
            state: true,
            createdAt: true,
            repository: {
              select: {
                id: true,
                name: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalReviews = await prisma.codeReview.count({
      where: filter,
    });

    const totalPages = Math.ceil(totalReviews / limit);

    const response: PaginatedResponse<ReviewInfo> = {
      data: reviews as unknown as ReviewInfo[],
      total: totalReviews,
      page,
      totalPages,
    };

    return response;
  }
}
