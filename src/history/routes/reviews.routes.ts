import { Router } from 'express';
import { CodeReviewController } from '../controllers/code-review.controller';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { PullRequestFiltersWithStateSchema } from 'src/common/schemas/pull-request-filters-with-state.schema';
import { container } from 'src/app/config/container-config';

const reviewsRouter = Router();

export const registerRoutes = () => {
  const codeReviewController = container.get(CodeReviewController);

  /**
   * @swagger
   * /api/history/reviews:
   *   post:
   *     summary: Get detailed code review information
   *     description: Retrieves detailed information about code reviews based on filters
   *     tags: [CodeReviews]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of items per page
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PullRequestFiltersWithState'
   *     responses:
   *       200:
   *         description: Detailed code review information with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedCodeReviewDetailedInfoResponse'
   *       400:
   *         description: Invalid request body
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
   */
  reviewsRouter.post(
    '/',
    validateBody(PullRequestFiltersWithStateSchema),
    codeReviewController.getCodeReviewsDetailedInfo,
  );
};

if (process.env.NODE_ENV !== 'test') {
  registerRoutes();
}

export { reviewsRouter };
