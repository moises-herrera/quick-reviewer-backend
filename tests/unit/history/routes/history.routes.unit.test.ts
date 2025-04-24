import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { historyAccountsRouter } from 'src/history/routes/history-accounts.routes';
import { registerRoutes } from 'src/history/routes/history.routes';
import { historyReviewsRouter } from 'src/history/routes/history-reviews.routes';

describe('History Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should use the gitHubAuthMiddleware', () => {
    registerRoutes();

    expect(router.use).toHaveBeenCalledWith(gitHubAuthMiddleware);
  });

  it('should register the accounts router', () => {
    registerRoutes();

    expect(router.use).toHaveBeenCalledWith('/accounts', historyAccountsRouter);
  });

  it('should register the reviews router', () => {
    registerRoutes();

    expect(router.use).toHaveBeenCalledWith('/reviews', historyReviewsRouter);
  });
});
