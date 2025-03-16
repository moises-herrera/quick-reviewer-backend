import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { inject } from 'inversify';
import { PullRequestRepository } from 'src/core/repositories/pull-request.repository';

/**
 * @swagger
 * tags:
 *   name: PullRequests
 *   description: Endpoints for managing pull requests
 */
export class PullRequestController {
  constructor(
    @inject(PullRequestRepository)
    private readonly pullRequestRepository: PullRequestRepository,
  ) {}

  /**
   * @swagger
   * /api/history/accounts/{ownerName}/repositories/{repositoryName}/pull-requests:
   *   get:
   *     summary: Get pull requests
   *     description: Retrieves pull requests for a specific repository
   *     tags: [PullRequests]
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
   *         description: List of pull requests with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedPullRequestsResponse'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Repository not found
   *       500:
   *         description: Server error
   */
  getPullRequests: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const { ownerName, repositoryName } = req.params;
      const options = parsePaginationOptions(req.query);
      const response = await this.pullRequestRepository.getPullRequests({
        ...options,
        userId,
        ownerName,
        repositoryName,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
