import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { ProjectRepository } from 'src/core/repositories/project.repository';

/**
 * @swagger
 * tags:
 *   name: Repository
 *   description: Endpoints for repository management
 */
export class RepositoryController {
  constructor(
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  /**
   * @swagger
   * /api/history/accounts/{ownerName}/repositories:
   *   get:
   *     summary: Get repositories for account
   *     description: Retrieves all repositories for a specific account (organization or user)
   *     tags: [Repository]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: path
   *         name: ownerName
   *         required: true
   *         schema:
   *           type: string
   *         description: Name of the owner (organization or user)
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
   *         description: List of repositories with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedRepositoriesResponse'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Owner not found
   *       500:
   *         description: Server error
   */
  getRepositories: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const ownerName = req.params.ownerName;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.projectRepository.getRepositories({
        ...paginationOptions,
        userId,
        ownerName,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
