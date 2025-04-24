import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { PullRequestFiltersSchema } from 'src/common/schemas/pull-request-filters.schema';
import { PullRequestFiltersWithStateSchema } from 'src/common/schemas/pull-request-filters-with-state.schema';
import { container } from 'src/app/config/container-config';

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Endpoints for getting app statistics.
 */

const statisticsRouter = Router();

export const registerRoutes = () => {
  const statisticsController = container.get(StatisticsController);

  statisticsRouter.use(gitHubAuthMiddleware);

  // KPI routes

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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  statisticsRouter.post(
    '/pull-requests/average-creation-count-by-repository',
    validateBody(PullRequestFiltersSchema),
    statisticsController.getPullRequestAverageCreationCountByRepository,
  );

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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  statisticsRouter.post(
    '/pull-requests/average-completion-time',
    validateBody(PullRequestFiltersSchema),
    statisticsController.getPullRequestAverageCompletionTime,
  );

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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  statisticsRouter.post(
    '/pull-requests/initial-review-average-time',
    validateBody(PullRequestFiltersWithStateSchema),
    statisticsController.getInitialReviewAverageTime,
  );

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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  statisticsRouter.post(
    '/pull-requests/average-review-count',
    validateBody(PullRequestFiltersWithStateSchema),
    statisticsController.getAverageReviewCount,
  );

  // Chart routes

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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  statisticsRouter.post(
    '/pull-requests/count-by-repository',
    validateBody(PullRequestFiltersWithStateSchema),
    statisticsController.getPullRequestCountByRepository,
  );

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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  statisticsRouter.post(
    '/pull-requests/review-count-by-repository',
    validateBody(PullRequestFiltersWithStateSchema),
    statisticsController.getReviewCountByRepository,
  );
};

if (process.env.NODE_ENV !== 'test') {
  registerRoutes();
}

export { statisticsRouter };
