import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { PullRequestController } from 'src/history/controllers/pull-request.controller';
import { MockPullRequestRepository } from 'tests/mocks/repositories/mock-pull-request.repository';

describe('PullRequestController', () => {
  let controller: PullRequestController;
  let pullRequestRepository: PullRequestRepository;

  beforeEach(() => {
    pullRequestRepository = new MockPullRequestRepository();
    controller = new PullRequestController(pullRequestRepository);
  });

  describe('getPullRequests', () => {
    it('should call pullRequestRepository.getPullRequests with correct parameters', async () => {
      const req = {
        userId: 'userId',
        params: {
          ownerName: 'ownerName',
          repositoryName: 'repositoryName',
        },
        query: {
          search: 'search',
          page: 1,
          limit: 10,
        },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getPullRequests(req, res, next);

      expect(pullRequestRepository.getPullRequests).toHaveBeenCalledWith({
        userId: 'userId',
        ownerName: 'ownerName',
        repositoryName: 'repositoryName',
        search: 'search',
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if pullRequestRepository.getPullRequests throws', async () => {
      const req = {
        userId: 'userId',
        params: {
          ownerName: 'ownerName',
          repositoryName: 'repositoryName',
        },
        query: {
          search: 'search',
          page: 1,
          limit: 10,
        },
      } as unknown as AuthRequest;
      const res = {} as Response;
      const next = vi.fn();
      const error = new Error('Test error');
      pullRequestRepository.getPullRequests = vi.fn().mockRejectedValue(error);

      await controller.getPullRequests(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
