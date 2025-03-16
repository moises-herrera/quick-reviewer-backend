import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { CodeReviewRepository } from 'src/core/repositories/code-review.repository';

/**
 * @swagger
 * tags:
 *   name: CodeReviews
 *   description: Endpoints for managing code reviews
 */
export class CodeReviewController {
  constructor(
    @inject(CodeReviewRepository)
    private readonly codeReviewRepository: CodeReviewRepository,
  ) {}

  /**
   * @swagger
   * /api/history/accounts/{ownerName}/repositories/{repositoryName}/pull-requests/{pullRequestNumber}/reviews:
   *   get:
   *     summary: Get code reviews for a pull request
   *     description: Retrieves code reviews for a specific pull request
   *     tags: [CodeReviews]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: path
   *         name: ownerName
   *         required: true
   *         schema:
   *           type: string
   *         description: Name of the repository owner
   *       - in: path
   *         name: repositoryName
   *         required: true
   *         schema:
   *           type: string
   *         description: Name of the repository
   *       - in: path
   *         name: pullRequestNumber
   *         required: true
   *         schema:
   *           type: integer
   *         description: Pull request number
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
   *     responses:
   *       200:
   *         description: List of code reviews with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedCodeReviewsResponse'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Pull request not found
   *       500:
   *         description: Server error
   */
  getCodeReviewsReviews: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const userId = req.userId as number;
      const { ownerName, repositoryName, pullRequestNumber } = req.params;
      const options = parsePaginationOptions(req.query);
      const response = await this.codeReviewRepository.getCodeReviews({
        ...options,
        userId,
        ownerName,
        repositoryName,
        pullRequestNumber: Number(pullRequestNumber),
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

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
  getCodeReviewsDetailedInfo: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const options = parsePaginationOptions(req.query);
      const response =
        await this.codeReviewRepository.getCodeReviewsDetailedInfo({
          ...(req.body as PullRequestFiltersType),
          ...options,
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
