import { Router } from 'express';
import { CodeReviewController } from '../controllers/code-review.controller';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { PullRequestFiltersWithStateSchema } from 'src/statistics/schemas/pull-request-filters-with-state.schema';

const reviewsRouter = Router();
const codeReviewController = new CodeReviewController();

reviewsRouter.post(
  '/',
  validateBody(PullRequestFiltersWithStateSchema),
  codeReviewController.getCodeReviewsDetailedInfo,
);

export { reviewsRouter };
