import { Router } from 'express';
import { accountSettingsRouter } from 'src/accounts/routes/account-settings.routes';
import { registerRoutes } from 'src/accounts/routes/account.routes';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';

describe('Account Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should register the auth middleware and subroutes', () => {
    registerRoutes();

    expect(router.use).toHaveBeenCalledWith(gitHubAuthMiddleware);
    expect(router.use).toHaveBeenCalledWith(accountSettingsRouter);
  });
});
