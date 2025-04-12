import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { accountsRouter } from './accounts.routes';
import { reviewsRouter } from './reviews.routes';

const historyRouter = Router();

historyRouter.use(gitHubAuthMiddleware);

historyRouter.use('/accounts', accountsRouter);
historyRouter.use('/reviews', reviewsRouter);

export { historyRouter };
