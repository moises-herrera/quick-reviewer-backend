import { NextFunction, Response } from 'express';
import { StatisticsService } from '../services/statistics.service';
import { StatusCodes } from 'http-status-codes';
import { PullRequestAverageCompletionTime } from '../schemas/pull-request-average-completion-time.schema';
import { PullRequestInitialAverageTime } from '../schemas/pull-request-initial-average-time.schema';
import { AuthRequest } from 'src/common/interfaces/auth-request';

export class StatisticsController {
  private readonly statisticsService = new StatisticsService();

  async getPullRequestAverageCreationCountByRepository(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response =
        await this.statisticsService.getPullRequestAverageCreationCountByRepository(
          {
            ...(req.body as PullRequestAverageCompletionTime),
            userId: req.userId as number,
          },
        );

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPullRequestAverageCompletionTime(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response =
        await this.statisticsService.getPullRequestAverageCompletionTime({
          ...(req.body as PullRequestAverageCompletionTime),
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getInitialReviewAverageTime(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await this.statisticsService.getInitialReviewAverageTime(
        {
          ...(req.body as PullRequestInitialAverageTime),
          userId: req.userId as number,
        },
      );

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAverageReviewCount(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response = await this.statisticsService.getAverageReviewCount({
        ...(req.body as PullRequestInitialAverageTime),
        userId: req.userId as number,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getReviewCountByRepository(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response =
        await this.statisticsService.getPullRequestReviewCountByRepository({
          ...(req.body as PullRequestInitialAverageTime),
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPullRequestCountByRepository(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const response =
        await this.statisticsService.getPullRequestCountByRepository({
          ...(req.body as PullRequestInitialAverageTime),
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
