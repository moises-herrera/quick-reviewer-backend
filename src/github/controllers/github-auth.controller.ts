import { gitHubAuthApp } from 'src/github/config/github-auth-app';
import { envConfig } from 'src/config/env-config';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';
import { CryptoService } from 'src/common/services/crypto.service';
import { CookieService } from 'src/common/services/cookie.service';
import { Octokit } from '@octokit/rest';
import { User } from '@prisma/client';
import {
  AuthHttpHandler,
  HttpHandler,
} from 'src/common/interfaces/http-handler';
import { inject } from 'inversify';
import { UserRepository } from 'src/core/repositories/user-repository.interface';
import { RegisterUserService } from 'src/core/services/register-user.service';
import {
  GITHUB_ACCESS_TOKEN,
  GITHUB_REFRESH_TOKEN,
  OAUTH_STATE,
} from 'src/github/constants/auth';

/**
 * @swagger
 * tags:
 *   name: GitHub Auth
 *   description: Endpoints for GitHub authentication
 */
export class GitHubAuthController {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
    @inject(RegisterUserService)
    private readonly registerUserService: RegisterUserService,
  ) {}

  /**
   * @swagger
   * /api/github/auth/login:
   *   get:
   *     summary: Initiates GitHub OAuth flow
   *     description: Generates a state token and redirects the user to GitHub authorization page
   *     tags: [GitHub Auth]
   *     responses:
   *       302:
   *         description: Redirects to GitHub authorization page
   *       500:
   *         description: Server error
   */
  getAuthorizationUrl: HttpHandler = async (_req, res, next): Promise<void> => {
    try {
      const state = CryptoService.generateRandomBytes(16);
      const { url } = gitHubAuthApp.getWebFlowAuthorizationUrl({
        state,
      });

      CookieService.setCookie(res, OAUTH_STATE, state, {
        maxAge: 1000 * 60 * 5, // 5 minutes
      });

      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/github/auth/callback:
   *   get:
   *     summary: GitHub OAuth callback
   *     description: Processes the GitHub OAuth callback, exchanges the code for tokens and registers/logs in the user
   *     tags: [GitHub Auth]
   *     parameters:
   *       - in: query
   *         name: code
   *         schema:
   *           type: string
   *         required: true
   *         description: GitHub OAuth code
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *         required: false
   *         description: State token for CSRF protection
   *     responses:
   *       302:
   *         description: Redirects to dashboard on success or login page on error
   *       500:
   *         description: Server error
   */
  getAccessToken: HttpHandler = async (req, res, next): Promise<void> => {
    try {
      res.clearCookie(OAUTH_STATE);

      const { code } = req.query;
      let authentication:
        | Awaited<
            ReturnType<typeof gitHubAuthApp.createToken>
          >['authentication']
        | undefined;

      try {
        const result = await gitHubAuthApp.createToken({
          code: code as string,
        });
        authentication = result.authentication;
      } catch (error) {
        throw new HttpException(
          'Error getting access token',
          StatusCodes.INTERNAL_SERVER_ERROR,
          error,
        );
      }

      const octokit = new Octokit({ auth: authentication?.token });
      this.registerUserService.setGitProvider(octokit);

      const { data: user } = await octokit.request('GET /user');

      const existingUser = await this.userRepository.getUserById(
        user.id as unknown as bigint,
      );

      if (!existingUser) {
        const userData: User = {
          id: user.id as unknown as bigint,
          name: user.name,
          username: user.login,
          email: user.notification_email ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.registerUserService.registerUserData(userData);
      } else {
        await this.registerUserService.registerHistory(existingUser);
      }

      CookieService.setCookie(res, GITHUB_ACCESS_TOKEN, authentication.token);
      CookieService.setCookie(
        res,
        GITHUB_REFRESH_TOKEN,
        authentication.refreshToken || '',
        { maxAge: 1000 * 60 * 60 * 24 * 30 },
      );

      res.redirect(`${envConfig.FRONTEND_URL}/dashboard`);
    } catch (error) {
      res.redirect(`${envConfig.FRONTEND_URL}/auth/login?error=true`);
      next(error);
    }
  };

  /**
   * @swagger
   * /api/github/auth/check-token:
   *   get:
   *     summary: Checks the user's authentication
   *     description: Verifies if the user is authenticated using the GitHub token
   *     tags: [GitHub Auth]
   *     security:
   *       - githubAuth: []
   *     responses:
   *       200:
   *         description: User is authenticated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: User is not authenticated
   */
  checkToken: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const { userId } = req;

      const user = await this.userRepository.getUserById(
        userId as unknown as bigint,
      );

      res.status(StatusCodes.OK).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/github/auth/refresh-token:
   *   post:
   *     summary: Refreshes the GitHub token
   *     description: Exchanges the refresh token for a new access token
   *     tags: [GitHub Auth]
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Refresh token not provided or invalid
   *       404:
   *         description: User not found
   */
  refreshToken: HttpHandler = async (req, res, next): Promise<void> => {
    try {
      const { githubRefreshToken } = req.cookies;

      if (!githubRefreshToken) {
        throw new HttpException(
          'Refresh token not provided',
          StatusCodes.BAD_REQUEST,
        );
      }

      const { authentication } = await gitHubAuthApp.refreshToken({
        refreshToken: githubRefreshToken,
      });

      CookieService.setCookie(res, GITHUB_ACCESS_TOKEN, authentication.token);
      CookieService.setCookie(
        res,
        GITHUB_REFRESH_TOKEN,
        authentication.refreshToken || '',
        { maxAge: 1000 * 60 * 60 * 24 * 30 },
      );

      const {
        status,
        data: { user },
      } = await gitHubAuthApp.checkToken({
        token: authentication.token,
      });

      if (status >= 400 || !user) {
        throw new HttpException(
          'Error getting the user information',
          status || StatusCodes.BAD_REQUEST,
        );
      }

      const existingUser = await this.userRepository.getUserById(
        user.id as unknown as bigint,
      );

      if (!existingUser) {
        throw new HttpException(
          'The user is not registered',
          StatusCodes.NOT_FOUND,
        );
      }

      res.status(StatusCodes.OK).json({
        user: existingUser,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /api/github/auth/logout:
   *   post:
   *     summary: Logs out the user
   *     description: Clears the GitHub access and refresh tokens from cookies
   *     tags: [GitHub Auth]
   *     responses:
   *       200:
   *         description: Logged out successfully
   */
  logout: HttpHandler = async (_req, res, next): Promise<void> => {
    try {
      res.clearCookie(GITHUB_ACCESS_TOKEN);
      res.clearCookie(GITHUB_REFRESH_TOKEN);
      res.status(StatusCodes.OK).json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
