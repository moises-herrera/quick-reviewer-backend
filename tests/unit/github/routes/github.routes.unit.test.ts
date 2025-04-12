import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { gitHubOAuthMiddleware } from 'src/github/middlewares/github-oauth.middleware';
import { registerRoutes } from 'src/github/routes/github.routes';

const mockController = vi.hoisted(() => ({
  getAuthorizationUrl: vi.fn(),
  getAccessToken: vi.fn(),
  checkToken: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: vi.fn(() => mockController),
  },
}));

describe('GitHub Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should define the /auth/login route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/auth/login',
      mockController.getAuthorizationUrl,
    );
  });

  it('should define the /auth/callback route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/auth/callback',
      gitHubOAuthMiddleware,
      mockController.getAccessToken,
    );
  });

  it('should define the /auth/check-token route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/auth/check-token',
      gitHubAuthMiddleware,
      mockController.checkToken,
    );
  });

  it('should define the /auth/refresh-token route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/auth/refresh-token',
      mockController.refreshToken,
    );
  });

  it('should define the /auth/logout route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/auth/logout',
      mockController.logout,
    );
  });
});
