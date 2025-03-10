import { Router } from 'express';
import { StatisticsController } from './controllers/statistics.controller';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { PullRequestAverageCompletionTimeSchema } from './schemas/pull-request-average-completion-time.schema';
import { PullRequestInitialAverageTimeSchema } from './schemas/pull-request-initial-average-time.schema';
import { ReviewController } from './controllers/review.controller';

const statisticsRouter = Router();
const statisticsController = new StatisticsController();
const reviewController = new ReviewController();

statisticsRouter.use(gitHubAuthMiddleware);

// KPI routes
statisticsRouter.post(
  '/pull-requests/average-creation-count-by-repository',
  validateBody(PullRequestAverageCompletionTimeSchema),
  statisticsController.getPullRequestAverageCreationCountByRepository.bind(
    statisticsController,
  ),
);

statisticsRouter.post(
  '/pull-requests/average-completion-time',
  validateBody(PullRequestAverageCompletionTimeSchema),
  statisticsController.getPullRequestAverageCompletionTime.bind(
    statisticsController,
  ),
);

statisticsRouter.post(
  '/pull-requests/initial-review-average-time',
  validateBody(PullRequestInitialAverageTimeSchema),
  statisticsController.getInitialReviewAverageTime.bind(statisticsController),
);

statisticsRouter.post(
  '/pull-requests/average-review-count',
  validateBody(PullRequestInitialAverageTimeSchema),
  statisticsController.getAverageReviewCount.bind(statisticsController),
);

// Chart routes
statisticsRouter.post(
  '/pull-requests/count-by-repository',
  validateBody(PullRequestInitialAverageTimeSchema),
  statisticsController.getPullRequestCountByRepository.bind(
    statisticsController,
  ),
);

statisticsRouter.post(
  '/pull-requests/review-count-by-repository',
  validateBody(PullRequestInitialAverageTimeSchema),
  statisticsController.getReviewCountByRepository.bind(statisticsController),
);

statisticsRouter.post(
  '/reviews',
  validateBody(PullRequestInitialAverageTimeSchema),
  reviewController.getPullRequestReviews.bind(reviewController),
);

export { statisticsRouter };
