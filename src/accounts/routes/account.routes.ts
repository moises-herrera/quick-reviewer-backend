import { Router } from 'express';
import { accountSettingsRouter } from './account-settings.routes';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Endpoints for managing accounts
 */
const accountsRouter = Router();

const registerRoutes = () => {
  accountsRouter.use(gitHubAuthMiddleware);
  accountsRouter.use(accountSettingsRouter);
};

registerRoutes();

export { accountsRouter };
