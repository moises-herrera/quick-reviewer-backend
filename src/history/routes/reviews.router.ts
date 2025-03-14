import { Router } from 'express';
import { CodeReviewController } from '../controllers/code-review.controller';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { PullRequestFiltersWithStateSchema } from 'src/statistics/schemas/pull-request-filters-with-state.schema';
import { container } from 'src/config/inversify-config';

const reviewsRouter = Router();
const codeReviewController = container.get(CodeReviewController);

reviewsRouter.post(
  '/',
  validateBody(PullRequestFiltersWithStateSchema),
  codeReviewController.getCodeReviewsDetailedInfo,
);

export { reviewsRouter };
