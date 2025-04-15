import { PullRequestComment } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { PostgresPullRequestCommentRepository } from 'src/common/database/repositories/postgres-pull-request-comment.repository';
import { MockDbClient } from 'tests/mocks/repositories/mock-db-client';

describe('PostgresPullRequestCommentRepository', () => {
  let dbClient: DbClient;
  let pullRequestCommentRepository: PostgresPullRequestCommentRepository;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    pullRequestCommentRepository = new PostgresPullRequestCommentRepository(
      dbClient,
    );
  });

  describe('savePullRequestComment', () => {
    it('should save a pull request comment', async () => {
      const data: PullRequestComment = {
        id: '1',
        pullRequestId: '123',
        body: 'Test comment',
        user: 'bot',
        userType: 'Bot',
        type: 'comment',
        commitId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(dbClient.pullRequestComment, 'create').mockResolvedValue(data);

      const result =
        await pullRequestCommentRepository.savePullRequestComment(data);

      expect(result).toEqual(data);
    });
  });

  describe('savePullRequestComments', () => {
    it('should save multiple pull request comments', async () => {
      const data: PullRequestComment[] = [
        {
          id: '1',
          pullRequestId: '123',
          body: 'Test comment 1',
          user: 'bot',
          userType: 'Bot',
          type: 'comment',
          commitId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          pullRequestId: '123',
          body: 'Test comment 2',
          user: 'bot',
          userType: 'Bot',
          type: 'comment',
          commitId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await pullRequestCommentRepository.savePullRequestComments(data);

      expect(dbClient.pullRequestComment.createMany).toHaveBeenCalledWith({
        data,
      });
    });
  });

  describe('getPullRequestComment', () => {
    it('should get a pull request comment', async () => {
      const filter: Partial<PullRequestComment> = {
        id: '1',
        pullRequestId: '123',
      };

      const data: PullRequestComment = {
        id: '1',
        pullRequestId: '123',
        body: 'Test comment',
        user: 'bot',
        userType: 'Bot',
        type: 'comment',
        commitId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(dbClient.pullRequestComment, 'findFirst').mockResolvedValue(
        data,
      );

      const result =
        await pullRequestCommentRepository.getPullRequestComment(filter);

      expect(result).toEqual(data);
      expect(dbClient.pullRequestComment.findFirst).toHaveBeenCalledWith({
        where: filter,
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('getPullRequestComments', () => {
    it('should get pull request comments', async () => {
      const pullRequestId = '123';

      const data: PullRequestComment[] = [
        {
          id: '1',
          pullRequestId: '123',
          body: 'Test comment 1',
          user: 'bot',
          userType: 'Bot',
          type: 'comment',
          commitId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          pullRequestId: '123',
          body: 'Test comment 2',
          user: 'bot',
          userType: 'Bot',
          type: 'comment',
          commitId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(dbClient.pullRequestComment, 'findMany').mockResolvedValue(
        data,
      );

      const result = await pullRequestCommentRepository.getPullRequestComments(
        pullRequestId,
      );

      expect(result).toEqual(data);
      expect(dbClient.pullRequestComment.findMany).toHaveBeenCalledWith({
        where: {
          pullRequestId,
        },
      });
    });
  });

  describe('updatePullRequestComment', () => {
    it('should update a pull request comment', async () => {
      const id = '1';
      const data: Partial<PullRequestComment> = {
        body: 'Updated comment',
      };

      await pullRequestCommentRepository.updatePullRequestComment(id, data);

      expect(dbClient.pullRequestComment.update).toHaveBeenCalledWith({
        where: {
          id,
        },
        data,
      });
    });
  });

  describe('deletePullRequestComment', () => {
    it('should delete a pull request comment', async () => {
      const id = '1';

      await pullRequestCommentRepository.deletePullRequestComment(id);

      expect(dbClient.pullRequestComment.delete).toHaveBeenCalledWith({
        where: {
          id,
        },
      });
    });
  });
});
