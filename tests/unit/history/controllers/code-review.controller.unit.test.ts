import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { CodeReviewController } from 'src/history/controllers/code-review.controller';
import { MockCodeReviewRepository } from 'tests/mocks/repositories/mock-code-review.repository';

describe('CodeReviewController', () => {
  let controller: CodeReviewController;
  let codeReviewRepository: CodeReviewRepository;

  beforeEach(() => {
    codeReviewRepository = new MockCodeReviewRepository();
    controller = new CodeReviewController(codeReviewRepository);
  });

  describe('getCodeReviews', () => {
    const req = {
      userId: 'userId',
      params: {
        ownerName: 'ownerName',
        repositoryName: 'repositoryName',
        pullRequestNumber: 1,
      },
      query: {
        search: 'search',
        page: 1,
        limit: 10,
      },
    } as unknown as AuthRequest;

    it('should call codeReviewRepository.getCodeReviews with correct parameters', async () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getCodeReviews(req, res, next);

      expect(codeReviewRepository.getCodeReviews).toHaveBeenCalledWith({
        userId: 'userId',
        ownerName: 'ownerName',
        repositoryName: 'repositoryName',
        pullRequestNumber: 1,
        search: 'search',
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if codeReviewRepository.getCodeReviews throws', async () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      const error = new Error('Error');
      vi.spyOn(codeReviewRepository, 'getCodeReviews').mockRejectedValue(error);

      await controller.getCodeReviews(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getCodeReviewsDetailedInfo', () => {
    const req = {
      userId: 'userId',
      body: {
        repositories: ['repository1', 'repository2'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
      },
      query: {
        search: 'search',
        page: 1,
        limit: 10,
      },
    } as unknown as AuthRequest;

    it('should call codeReviewRepository.getCodeReviewsDetailedInfo with correct parameters', async () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getCodeReviewsDetailedInfo(req, res, next);

      expect(
        codeReviewRepository.getCodeReviewsDetailedInfo,
      ).toHaveBeenCalledWith({
        userId: 'userId',
        repositories: ['repository1', 'repository2'],
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-31'),
        search: 'search',
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if codeReviewRepository.getCodeReviewsDetailedInfo throws', async () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      const error = new Error('Error');
      vi.spyOn(
        codeReviewRepository,
        'getCodeReviewsDetailedInfo',
      ).mockRejectedValue(error);

      await controller.getCodeReviewsDetailedInfo(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
