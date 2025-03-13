import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { PullRequestFiltersSchema } from '../schemas/pull-request-filters.schema';
import { PullRequestFiltersWithStateSchema } from '../schemas/pull-request-filters-with-state.schema';

const statisticsRouter = Router();
const statisticsController = new StatisticsController();

statisticsRouter.use(gitHubAuthMiddleware);

// KPI routes
statisticsRouter.post(
  '/pull-requests/average-creation-count-by-repository',
  validateBody(PullRequestFiltersSchema),
  statisticsController.getPullRequestAverageCreationCountByRepository,
);

statisticsRouter.post(
  '/pull-requests/average-completion-time',
  validateBody(PullRequestFiltersSchema),
  statisticsController.getPullRequestAverageCompletionTime,
);

statisticsRouter.post(
  '/pull-requests/initial-review-average-time',
  validateBody(PullRequestFiltersWithStateSchema),
  statisticsController.getInitialReviewAverageTime,
);

statisticsRouter.post(
  '/pull-requests/average-review-count',
  validateBody(PullRequestFiltersWithStateSchema),
  statisticsController.getAverageReviewCount,
);

// Chart routes
statisticsRouter.post(
  '/pull-requests/count-by-repository',
  validateBody(PullRequestFiltersWithStateSchema),
  statisticsController.getPullRequestCountByRepository,
);

statisticsRouter.post(
  '/pull-requests/review-count-by-repository',
  validateBody(PullRequestFiltersWithStateSchema),
  statisticsController.getReviewCountByRepository,
);

export { statisticsRouter };
