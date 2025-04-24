import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { historyAccountsRouter } from './history-accounts.routes';
import { historyReviewsRouter } from './history-reviews.routes';

const historyRouter = Router();

export const registerRoutes = () => {
  historyRouter.use(gitHubAuthMiddleware);

  historyRouter.use('/accounts', historyAccountsRouter);
  historyRouter.use('/reviews', historyReviewsRouter);
};

if (process.env.NODE_ENV !== 'test') {
  registerRoutes();
}

export { historyRouter };
