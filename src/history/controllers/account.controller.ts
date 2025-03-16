import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { inject } from 'inversify';
import { AccountRepository } from 'src/core/repositories/account.repository';

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Endpoints for managing GitHub accounts
 */
export class AccountController {
  constructor(
    @inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  /**
   * @swagger
   * /api/history/accounts:
   *   get:
   *     summary: Get all accounts
   *     description: Retrieves all GitHub accounts (users and organizations) accessible to the authenticated user
   *     tags: [Accounts]
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
   *       500:
   *         description: Server error
   */
  getAllAccounts: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountRepository.getAccounts({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/history/accounts/organizations:
   *   get:
   *     summary: Get organizations
   *     description: Retrieves GitHub organizations accessible to the authenticated user
   *     tags: [Accounts]
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
   *       500:
   *         description: Server error
   */
  getOrganizations: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountRepository.getOrganizations({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/history/accounts/users:
   *   get:
   *     summary: Get users
   *     description: Retrieves GitHub users accessible to the authenticated user
   *     tags: [Accounts]
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
   *       500:
   *         description: Server error
   */
  getUsers: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountRepository.getUsers({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
