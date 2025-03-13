import { StatisticsService } from '../services/statistics.service';
import { StatusCodes } from 'http-status-codes';
import { PullRequestAverageCompletionTime } from '../schemas/pull-request-filters.schema';
import { PullRequestInitialAverageTime } from '../schemas/pull-request-filters-with-state.schema';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export class StatisticsController {
  private readonly statisticsService = new StatisticsService();

  getPullRequestAverageCreationCountByRepository: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
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
  };

  getPullRequestAverageCompletionTime: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
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
  };

  getInitialReviewAverageTime: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
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
  };

  getAverageReviewCount: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const response = await this.statisticsService.getAverageReviewCount({
        ...(req.body as PullRequestInitialAverageTime),
        userId: req.userId as number,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  getReviewCountByRepository: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
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
  };

  getPullRequestCountByRepository: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
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
  };
}
