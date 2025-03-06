import { Router } from 'express';
import { GitHubController } from './controllers/github.controller';
import { gitHubOAuthMiddleware } from './middlewares/github-oauth.middleware';
import { gitHubAuthMiddleware } from './middlewares/github-auth.middleware';

const gitHubRouter = Router();
const controller = new GitHubController();

gitHubRouter.get(
  '/auth/login',
  controller.getAuthorizationUrl.bind(controller),
);

gitHubRouter.get(
  '/oauth/callback',
  gitHubOAuthMiddleware,
  controller.getAccessToken.bind(controller),
);

gitHubRouter.get(
  '/auth/check-token',
  gitHubAuthMiddleware,
  controller.checkToken.bind(controller),
);

gitHubRouter.post(
  '/auth/refresh-token',
  controller.refreshToken.bind(controller),
);

gitHubRouter.post('/auth/logout', controller.logout.bind(controller));

export { gitHubRouter };
