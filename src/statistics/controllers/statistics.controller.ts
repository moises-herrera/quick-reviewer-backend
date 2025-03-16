import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { PullRequestFiltersWithStateType } from 'src/common/schemas/pull-request-filters-with-state.schema';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { StatisticsService } from 'src/core/services/statistics.service';

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Endpoints for getting app statistics.
 */
export class StatisticsController {
  constructor(
    @inject(StatisticsService)
    private readonly statisticsService: StatisticsService,
  ) {}

  /**
   * @swagger
   * /api/statistics/pull-requests/average-creation-count-by-repository:
   *   post:
   *     summary: Get average pull request creation count by repository
   *     description: Returns the average number of pull requests created per repository
   *     tags: [Statistics]
   *     security:
   *       - githubAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PullRequestFiltersWithState'
   *     responses:
   *       200:
   *         description: Average pull request creation count
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Metric'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getPullRequestAverageCreationCountByRepository: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const response =
        await this.statisticsService.getPullRequestAverageCreationCountByRepository(
          {
            ...(req.body as PullRequestFiltersType),
            userId: req.userId as number,
          },
        );

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/statistics/pull-requests/average-completion-time:
   *   post:
   *     summary: Get average pull request completion time
   *     description: Returns the average time it takes to complete a pull request
   *     tags: [Statistics]
   *     security:
   *       - githubAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PullRequestFiltersWithState'
   *     responses:
   *       200:
   *         description: Average pull request completion time
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Metric'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getPullRequestAverageCompletionTime: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const response =
        await this.statisticsService.getPullRequestAverageCompletionTime({
          ...(req.body as PullRequestFiltersType),
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/statistics/pull-requests/initial-review-average-time:
   *   post:
   *     summary: Get average time for initial review
   *     description: Returns the average time it takes for a pull request to receive its first review
   *     tags: [Statistics]
   *     security:
   *       - githubAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PullRequestFiltersWithState'
   *     responses:
   *       200:
   *         description: Average initial review time
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Metric'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getInitialReviewAverageTime: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const response = await this.statisticsService.getInitialReviewAverageTime(
        {
          ...(req.body as PullRequestFiltersWithStateType),
          userId: req.userId as number,
        },
      );

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/statistics/pull-requests/average-review-count:
   *   post:
   *     summary: Get average number of reviews per pull request
   *     description: Returns the average number of reviews received per pull request
   *     tags: [Statistics]
   *     security:
   *       - githubAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PullRequestFiltersWithState'
   *     responses:
   *       200:
   *         description: Average review count
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Metric'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getAverageReviewCount: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const response =
        await this.statisticsService.getPullRequestAverageReviewCount({
          ...(req.body as PullRequestFiltersWithStateType),
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/statistics/pull-requests/review-count-by-repository:
   *   post:
   *     summary: Get review count by repository
   *     description: Returns chart data for showing the number of reviews per repository
   *     tags: [Statistics]
   *     security:
   *       - githubAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PullRequestFiltersWithState'
   *     responses:
   *       200:
   *         description: Review count by repository chart data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ChartData'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getReviewCountByRepository: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const response =
        await this.statisticsService.getPullRequestReviewCountByRepository({
          ...(req.body as PullRequestFiltersWithStateType),
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/statistics/pull-requests/count-by-repository:
   *   post:
   *     summary: Get pull request count by repository
   *     description: Returns chart data for showing the number of pull requests per repository
   *     tags: [Statistics]
   *     security:
   *       - githubAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PullRequestFiltersWithState'
   *     responses:
   *       200:
   *         description: Pull request count by repository chart data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ChartData'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  getPullRequestCountByRepository: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const response =
        await this.statisticsService.getPullRequestCountByRepository({
          ...(req.body as PullRequestFiltersWithStateType),
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
