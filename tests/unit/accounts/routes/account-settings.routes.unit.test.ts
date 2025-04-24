import { Router } from 'express';
import { registerRoutes } from 'src/accounts/routes/account-settings.routes';

const mockController = vi.hoisted(() => ({
  getAccountSettings: vi.fn(),
  updateAccountSettings: vi.fn(),
  syncRepositorySettings: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: vi.fn(() => mockController),
  },
}));

describe('AccountSettings Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should define the GET /:accountId/settings route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/:accountId/settings',
      mockController.getAccountSettings,
    );
  });

  it('should define the PUT /:accountId/settings route', () => {
    registerRoutes();

    expect(router.put).toHaveBeenCalledWith(
      '/:accountId/settings',
      expect.any(Function),
      mockController.updateAccountSettings,
    );
  });

  it('should define the DELETE /:accountId/settings/sync-repositories route', () => {
    registerRoutes();

    expect(router.delete).toHaveBeenCalledWith(
      '/:accountId/settings/sync-repositories',
      mockController.syncRepositorySettings,
    );
  });
});
