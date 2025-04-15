import { CodeReview, PullRequest } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { PostgresCodeReviewRepository } from 'src/common/database/repositories/postgres-code-review.repository';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { ReviewInfo } from 'src/github/interfaces/review-info';
import { MockDbClient } from 'tests/mocks/repositories/mock-db-client';

describe('PostgresCodeReviewRepository', () => {
  let dbClient: DbClient;
  let codeReviewRepository: PostgresCodeReviewRepository;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    codeReviewRepository = new PostgresCodeReviewRepository(dbClient);
  });

  describe('saveCodeReview', () => {
    it('should call dbClient.codeReview.create with correct parameters', async () => {
      const data: CodeReview = {
        id: '1',
        pullRequestId: '1',
        body: null,
        reviewer: 'reviewer',
        userType: 'User',
        status: 'APPROVED',
        commitId: '',
        createdAt: new Date(),
      };
      const createSpy = vi.spyOn(dbClient.codeReview, 'create');

      await codeReviewRepository.saveCodeReview(data);

      expect(createSpy).toHaveBeenCalledWith({ data });
    });
  });

  describe('saveCodeReviews', () => {
    it('should call dbClient.codeReview.createMany with correct parameters', async () => {
      const data: CodeReview[] = [
        {
          id: '1',
          pullRequestId: '1',
          body: null,
          reviewer: 'reviewer',
          userType: 'User',
          status: 'APPROVED',
          commitId: '',
          createdAt: new Date(),
        },
      ];
      const createManySpy = vi.spyOn(dbClient.codeReview, 'createMany');

      await codeReviewRepository.saveCodeReviews(data);

      expect(createManySpy).toHaveBeenCalledWith({ data });
    });
  });

  describe('getCodeReviews', () => {
    it('should call dbClient.codeReview.findMany with correct parameters', async () => {
      const options = {
        pullRequestNumber: 1,
        repositoryName: 'repo',
        ownerName: 'owner',
        userId: 'userId',
        page: 1,
        limit: 10,
        search: 'search',
      };
      const findFirstSpy = vi
        .spyOn(dbClient.pullRequest, 'findFirst')
        .mockResolvedValue({
          id: '1',
        } as unknown as PullRequest);
      const findManySpy = vi.spyOn(dbClient.codeReview, 'findMany');

      await codeReviewRepository.getCodeReviews(options);

      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          number: options.pullRequestNumber,
          repository: {
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
        },
      });
      expect(findManySpy).toHaveBeenCalledWith({
        where: {
          pullRequestId: expect.any(String),
          reviewer: {
            contains: options.search,
            mode: 'insensitive',
          },
        },
        take: options.limit,
        skip: 0,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should throw an error if pull request is not found', async () => {
      const options = {
        pullRequestNumber: 1,
        repositoryName: 'repo',
        ownerName: 'owner',
        userId: 'userId',
        page: 1,
        limit: 10,
        search: 'search',
      };
      const findFirstSpy = vi
        .spyOn(dbClient.pullRequest, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        codeReviewRepository.getCodeReviews(options),
      ).rejects.toThrowError('Pull request not found');
      expect(findFirstSpy).toHaveBeenCalledWith({
        where: {
          number: options.pullRequestNumber,
          repository: {
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
        },
      });
    });
  });

  describe('getCodeReviewsDetailedInfo', () => {
    it('should call dbClient.codeReview.findMany', async () => {
      const response: PaginatedResponse<ReviewInfo> = {
        data: [
          {
            id: '1',
            reviewer: 'reviewer',
            status: 'APPROVED',
            createdAt: new Date(),
            pullRequest: {
              id: '1',
              number: 1,
              title: 'title',
              state: 'OPEN',
              createdAt: new Date(),
              repository: {
                id: '1',
                name: 'repo',
                owner: {
                  id: '1',
                  name: 'owner',
                },
              },
            },
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      const options = {
        userId: '1',
        repositories: ['repo1', 'repo2'],
        page: 1,
        limit: 10,
        search: 'search',
        startDate: new Date(),
        endDate: new Date(),
      };
      const findManySpy = vi
        .spyOn(dbClient.codeReview, 'findMany')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(response.data as any);

        vi.spyOn(dbClient.codeReview, 'count').mockResolvedValue(1);

      const result =
        await codeReviewRepository.getCodeReviewsDetailedInfo(options);

      expect(findManySpy).toHaveBeenCalled();
      expect(result).toEqual(response);
    });
  });

  describe('getLastCodeReview', () => {
    it('should call dbClient.codeReview.findFirst with correct parameters', async () => {
      const filter: Partial<CodeReview> = {
        pullRequestId: '1',
        status: 'APPROVED',
      };
      const findFirstSpy = vi.spyOn(dbClient.codeReview, 'findFirst');

      await codeReviewRepository.getLastCodeReview(filter);

      expect(findFirstSpy).toHaveBeenCalledWith({
        where: filter,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });
});
