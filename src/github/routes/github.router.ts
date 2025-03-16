import { Router } from 'express';
import { GitHubAuthController } from 'src/github/controllers/github-auth.controller';
import { gitHubOAuthMiddleware } from 'src/github/middlewares/github-oauth.middleware';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { container } from 'src/config/container-config';

const gitHubRouter = Router();
const controller = container.get(GitHubAuthController);

gitHubRouter.get('/auth/login', controller.getAuthorizationUrl);

gitHubRouter.get(
  '/oauth/callback',
  gitHubOAuthMiddleware,
  controller.getAccessToken,
);

gitHubRouter.get(
  '/auth/check-token',
  gitHubAuthMiddleware,
  controller.checkToken,
);

gitHubRouter.post('/auth/refresh-token', controller.refreshToken);

gitHubRouter.post('/auth/logout', controller.logout);

export { gitHubRouter };
