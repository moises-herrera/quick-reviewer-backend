import { Router } from 'express';
import { AccountController } from 'src/history/controllers/account.controller';
import { RepositoryController } from 'src/history/controllers/repository.controller';
import { PullRequestController } from 'src/history/controllers/pull-request.controller';
import { CodeReviewController } from 'src/history/controllers/code-review.controller';
import { container } from 'src/app/config/container-config';

const historyAccountsRouter = Router();

export const registerRoutes = () => {
  const accountController = container.get(AccountController);
  const repositoryController = container.get(RepositoryController);
  const pullRequestController = container.get(PullRequestController);
  const codeReviewController = container.get(CodeReviewController);

  /**
   * @swagger
   * /api/history/accounts:
   *   get:
   *     summary: Get all accounts
   *     description: Retrieves all GitHub accounts (users and organizations) accessible to the authenticated user
   *     tags: [History]
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
   *     responses:
   *       200:
   *         description: List of accounts with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedAccountsResponse'
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
  historyAccountsRouter.get('/', accountController.getAllAccounts);

  /**
   * @swagger
   * /api/history/accounts/organizations:
   *   get:
   *     summary: Get organizations
   *     description: Retrieves GitHub organizations accessible to the authenticated user
   *     tags: [History]
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
   *     responses:
   *       200:
   *         description: List of organizations with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedAccountsResponse'
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
  historyAccountsRouter.get('/organizations', accountController.getOrganizations);

  /**
   * @swagger
   * /api/history/accounts/users:
   *   get:
   *     summary: Get users
   *     description: Retrieves GitHub users accessible to the authenticated user
   *     tags: [History]
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
   *     responses:
   *       200:
   *         description: List of users with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedAccountsResponse'
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
  historyAccountsRouter.get('/users', accountController.getUsers);

  /**
   * @swagger
   * tags:
   *   name: Repository
   *   description: Endpoints for repository management
   */

  /**
   * @swagger
   * /api/history/accounts/{ownerName}/repositories:
   *   get:
   *     summary: Get repositories for account
   *     description: Retrieves all repositories for a specific account (organization or user)
   *     tags: [History]
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
   *       - in: query
   *         name: includeSettings
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include settings in the response
   *     responses:
   *       200:
   *         description: List of repositories with pagination info
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PaginatedRepositoriesResponse'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       404:
   *         description: Owner not found
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
  historyAccountsRouter.get(
    '/:ownerName/repositories',
    repositoryController.getRepositories,
  );

  /**
   * @swagger
   * /api/history/accounts/{ownerName}/repositories/{repositoryName}/pull-requests:
   *   get:
   *     summary: Get pull requests
   *     description: Retrieves pull requests for a specific repository
   *     tags: [History]
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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       404:
   *         description: Repository not found
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
  historyAccountsRouter.get(
    '/:ownerName/repositories/:repositoryName/pull-requests',
    pullRequestController.getPullRequests,
  );


  /**
   * @swagger
   * /api/history/accounts/{ownerName}/repositories/{repositoryName}/pull-requests/{pullRequestNumber}/reviews:
   *   get:
   *     summary: Get code reviews for a pull request
   *     description: Retrieves code reviews for a specific pull request
   *     tags: [History]
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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       404:
   *         description: Pull request not found
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
  historyAccountsRouter.get(
    '/:ownerName/repositories/:repositoryName/pull-requests/:pullRequestNumber/reviews',
    codeReviewController.getCodeReviews,
  );
};

if (process.env.NODE_ENV !== 'test') {
  registerRoutes();
}

export { historyAccountsRouter };
