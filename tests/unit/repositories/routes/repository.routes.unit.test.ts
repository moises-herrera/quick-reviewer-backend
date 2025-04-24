import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { registerRoutes } from 'src/repositories/routes/repository.routes';
import { repositorySettingsRouter } from 'src/repositories/routes/repository-settings.routes';

describe('Repository Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should register the auth middleware and subroutes', () => {
    registerRoutes();

    expect(router.use).toHaveBeenCalledWith(gitHubAuthMiddleware);
    expect(router.use).toHaveBeenCalledWith(repositorySettingsRouter);
  });
});
