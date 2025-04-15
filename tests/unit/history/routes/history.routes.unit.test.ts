import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { accountsRouter } from 'src/history/routes/accounts.routes';
import { registerRoutes } from 'src/history/routes/history.routes';
import { reviewsRouter } from 'src/history/routes/reviews.routes';

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

    expect(router.use).toHaveBeenCalledWith('/accounts', accountsRouter);
  });

  it('should register the reviews router', () => {
    registerRoutes();

    expect(router.use).toHaveBeenCalledWith('/reviews', reviewsRouter);
  });
});
