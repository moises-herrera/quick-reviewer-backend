import { CodeReviewComment } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { PostgresCodeReviewCommentRepository } from 'src/common/database/repositories/postgres-code-review-comment.repository';
import { MockDbClient } from 'tests/mocks/mock-db-client';

describe('PostgresCodeReviewCommentRepository', () => {
  let dbClient: DbClient;
  let codeReviewCommentRepository: PostgresCodeReviewCommentRepository;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    codeReviewCommentRepository = new PostgresCodeReviewCommentRepository(
      dbClient,
    );
  });

  describe('getCodeReviewComments', () => {
    it('should get code review comments', async () => {
      const reviewId = 'reviewId';
      const expectedComments: CodeReviewComment[] = [
        {
          id: '1',
          codeReviewId: reviewId,
          body: 'Comment 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          diffHunk: null,
          line: null,
          position: null,
          side: '',
          path: '',
          replyToId: null,
          resolvedAt: null,
        },
        {
          id: '2',
          codeReviewId: reviewId,
          body: 'Comment 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          diffHunk: null,
          line: null,
          position: null,
          side: '',
          path: '',
          replyToId: null,
          resolvedAt: null,
        },
      ];

      vi.mocked(dbClient.codeReviewComment.findMany).mockResolvedValue(
        expectedComments,
      );

      const comments =
        await codeReviewCommentRepository.getCodeReviewComments(reviewId);

      expect(comments).toEqual(expectedComments);
    });
  });

  describe('saveCodeReviewComment', () => {
    it('should save a code review comment', async () => {
      const data: CodeReviewComment = {
        id: '1',
        codeReviewId: '2',
        body: 'Comment 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        diffHunk: null,
        line: null,
        position: null,
        side: '',
        path: '',
        replyToId: null,
        resolvedAt: null,
      };

      const createSpy = vi.spyOn(dbClient.codeReviewComment, 'create');
      await codeReviewCommentRepository.saveCodeReviewComment(data);

      expect(createSpy).toHaveBeenCalledWith({ data });
      expect(createSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveCodeReviewComments', () => {
    it('should save multiple code review comments', async () => {
      const comments: CodeReviewComment[] = [
        {
          id: '1',
          codeReviewId: 'review-id',
          body: 'Comment 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          diffHunk: null,
          line: null,
          position: null,
          side: '',
          path: '',
          replyToId: null,
          resolvedAt: null,
        },
        {
          id: '2',
          codeReviewId: 'review-id',
          body: 'Comment 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          diffHunk: null,
          line: null,
          position: null,
          side: '',
          path: '',
          replyToId: null,
          resolvedAt: null,
        },
      ];

      const createManySpy = vi.spyOn(dbClient.codeReviewComment, 'createMany');

      await codeReviewCommentRepository.saveCodeReviewComments(comments);

      expect(createManySpy).toHaveBeenCalledWith({ data: comments });
      expect(createManySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCodeReviewComment', () => {
    it('should update a code review comment', async () => {
      const id = '1';
      const data: Partial<CodeReviewComment> = {
        body: 'Updated comment',
      };

      const updateSpy = vi.spyOn(dbClient.codeReviewComment, 'update');
      await codeReviewCommentRepository.updateCodeReviewComment(id, data);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id },
        data,
      });
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteCodeReviewComment', () => {
    it('should delete a code review comment', async () => {
      const id = '1';

      const deleteSpy = vi.spyOn(dbClient.codeReviewComment, 'delete');
      await codeReviewCommentRepository.deleteCodeReviewComment(id);

      expect(deleteSpy).toHaveBeenCalledWith({ where: { id } });
      expect(deleteSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateCodeReviewComments', () => {
    it('should update multiple code review comments', async () => {
      const ids = ['1', '2'];
      const data: Partial<CodeReviewComment> = {
        body: 'Updated comment',
      };

      const updateManySpy = vi.spyOn(dbClient.codeReviewComment, 'updateMany');
      await codeReviewCommentRepository.updateCodeReviewComments(ids, data);

      expect(updateManySpy).toHaveBeenCalledWith({
        where: { id: { in: ids } },
        data,
      });
      expect(updateManySpy).toHaveBeenCalledTimes(1);
    });
  });
});
