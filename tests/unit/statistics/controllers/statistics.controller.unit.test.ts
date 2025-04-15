import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { StatisticsService } from 'src/statistics/abstracts/statistics.abstract';
import { StatisticsController } from 'src/statistics/controllers/statistics.controller';
import { MockStatisticsService } from 'tests/mocks/services/mock-statistics.service';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let statisticsService: StatisticsService;

  beforeEach(() => {
    statisticsService = new MockStatisticsService();
    controller = new StatisticsController(statisticsService);
  });

  describe('getPullRequestAverageCreationCountByRepository', () => {
    it('should call statisticsService.getPullRequestAverageCreationCountByRepository', async () => {
      const req = {
        userId: 'userId',
        body: {
          repositories: ['repo1', 'repo2'],
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getPullRequestAverageCreationCountByRepository(
        req,
        res,
        next,
      );

      expect(
        statisticsService.getPullRequestAverageCreationCountByRepository,
      ).toHaveBeenCalledWith({
        ...req.body,
        userId: req.userId,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if service throws', async () => {
      const req = {
        userId: 'userId',
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();
      const error = new Error('Service error');
      vi.spyOn(
        statisticsService,
        'getPullRequestAverageCreationCountByRepository',
      ).mockRejectedValue(error);

      await controller.getPullRequestAverageCreationCountByRepository(
        req,
        res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPullRequestAverageCompletionTime', () => {
    it('should call statisticsService.getPullRequestAverageCompletionTime', async () => {
      const req = {
        userId: 'userId',
        body: {
          repositories: ['repo1', 'repo2'],
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getPullRequestAverageCompletionTime(req, res, next);

      expect(
        statisticsService.getPullRequestAverageCompletionTime,
      ).toHaveBeenCalledWith({
        ...req.body,
        userId: req.userId,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if service throws', async () => {
      const req = {
        userId: 'userId',
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();
      const error = new Error('Service error');
      vi.spyOn(
        statisticsService,
        'getPullRequestAverageCompletionTime',
      ).mockRejectedValue(error);

      await controller.getPullRequestAverageCompletionTime(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getInitialReviewAverageTime', () => {
    it('should call statisticsService.getInitialReviewAverageTime', async () => {
      const req = {
        userId: 'userId',
        body: {
          repositories: ['repo1', 'repo2'],
          startDate: '2023-01-01',
          endDate: '2023-01-31',
          state: 'open',
        },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getInitialReviewAverageTime(req, res, next);

      expect(statisticsService.getInitialReviewAverageTime).toHaveBeenCalledWith({
        ...req.body,
        userId: req.userId,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if service throws', async () => {
      const req = {
        userId: 'userId',
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();
      const error = new Error('Service error');
      vi.spyOn(statisticsService, 'getInitialReviewAverageTime').mockRejectedValue(error);

      await controller.getInitialReviewAverageTime(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAverageReviewCount', () => {
    it('should call statisticsService.getPullRequestAverageReviewCount', async () => {
      const req = {
        userId: 'userId',
        body: {
          repositories: ['repo1', 'repo2'],
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getAverageReviewCount(req, res, next);

      expect(statisticsService.getPullRequestAverageReviewCount).toHaveBeenCalledWith({
        ...req.body,
        userId: req.userId,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if service throws', async () => {
      const req = {
        userId: 'userId',
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();
      const error = new Error('Service error');
      vi.spyOn(statisticsService, 'getPullRequestAverageReviewCount').mockRejectedValue(error);

      await controller.getAverageReviewCount(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getReviewCountByRepository', () => {
    it('should call statisticsService.getPullRequestReviewCountByRepository', async () => {
      const req = {
        userId: 'userId',
        body: {
          repositories: ['repo1', 'repo2'],
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getReviewCountByRepository(req, res, next);

      expect(
        statisticsService.getPullRequestReviewCountByRepository,
      ).toHaveBeenCalledWith({
        ...req.body,
        userId: req.userId,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if service throws', async () => {
      const req = {
        userId: 'userId',
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();
      const error = new Error('Service error');
      vi.spyOn(
        statisticsService,
        'getPullRequestReviewCountByRepository',
      ).mockRejectedValue(error);

      await controller.getReviewCountByRepository(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getPullRequestCountByRepository', () => {
    it('should call statisticsService.getPullRequestCountByRepository', async () => {
      const req = {
        userId: 'userId',
        body: {
          repositories: ['repo1', 'repo2'],
          startDate: '2023-01-01',
          endDate: '2023-01-31',
        },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getPullRequestCountByRepository(req, res, next);

      expect(statisticsService.getPullRequestCountByRepository).toHaveBeenCalledWith({
        ...req.body,
        userId: req.userId,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if service throws', async () => {
      const req = {
        userId: 'userId',
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();
      const error = new Error('Service error');
      vi.spyOn(statisticsService, 'getPullRequestCountByRepository').mockRejectedValue(error);

      await controller.getPullRequestCountByRepository(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
