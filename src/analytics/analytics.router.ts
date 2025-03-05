import { Router } from 'express';
import { AccountController } from './controllers/account.controller';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';

const analyticsRouter = Router();
const controller = new AccountController();

analyticsRouter.get(
  '/organizations',
  gitHubAuthMiddleware,
  controller.getOrganizations.bind(controller),
);

analyticsRouter.get(
  '/users',
  gitHubAuthMiddleware,
  controller.getUsers.bind(controller),
);

export { analyticsRouter };
