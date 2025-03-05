import { Router } from 'express';
import { GitHubController } from './controllers/github.controller';
import { gitHubOAuthMiddleware } from './middlewares/github-oauth.middleware';

const gitHubRouter = Router();
const controller = new GitHubController();

gitHubRouter.get('/login', controller.getAuthorizationUrl.bind(controller));

gitHubRouter.get(
  '/oauth/callback',
  gitHubOAuthMiddleware,
  controller.getAccessToken.bind(controller),
);

export { gitHubRouter };
