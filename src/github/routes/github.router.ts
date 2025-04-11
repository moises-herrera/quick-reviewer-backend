import { Router } from 'express';
import { GitHubAuthController } from 'src/github/controllers/github-auth.controller';
import { gitHubOAuthMiddleware } from 'src/github/middlewares/github-oauth.middleware';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { container } from 'src/app/config/container-config';

/**
 * @swagger
 * tags:
 *   name: GitHub Auth
 *   description: Endpoints for GitHub authentication
 */

const gitHubRouter = Router();
const controller = container.get(GitHubAuthController);

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
gitHubRouter.get('/auth/login', controller.getAuthorizationUrl);

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
gitHubRouter.get(
  '/auth/callback',
  gitHubOAuthMiddleware,
  controller.getAccessToken,
);

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
gitHubRouter.get(
  '/auth/check-token',
  gitHubAuthMiddleware,
  controller.checkToken,
);

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
gitHubRouter.post('/auth/refresh-token', controller.refreshToken);

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
gitHubRouter.post('/auth/logout', controller.logout);

export { gitHubRouter };
