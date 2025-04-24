import { Router } from 'express';
import { repositorySettingsRouter } from './repository-settings.routes';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';

const repositoriesRouter = Router();

export const registerRoutes = () => {
  repositoriesRouter.use(gitHubAuthMiddleware);
  repositoriesRouter.use(repositorySettingsRouter);
};

registerRoutes();

export { repositoriesRouter };
