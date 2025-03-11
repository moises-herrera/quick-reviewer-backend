import { Router } from 'express';
import { CodeReviewController } from './controllers/code-review.controller';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { PullRequestInitialAverageTimeSchema } from 'src/statistics/schemas/pull-request-initial-average-time.schema';

const reviewsRouter = Router();
const codeReviewController = new CodeReviewController();

reviewsRouter.post(
  '/',
  validateBody(PullRequestInitialAverageTimeSchema),
  codeReviewController.getCodeReviewsDetailedInfo.bind(codeReviewController),
);

export { reviewsRouter };
