import { Router } from 'express';
import { GitHubController } from './controllers/github.controller';

const gitHubRouter = Router();
const controller = new GitHubController();

gitHubRouter.get('/login', controller.getAuthorizationUrl.bind(controller));

gitHubRouter.get('/oauth/callback', controller.getAccessToken.bind(controller));

export { gitHubRouter };
