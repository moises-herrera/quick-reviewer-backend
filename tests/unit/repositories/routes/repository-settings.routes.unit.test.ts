import { Router } from 'express';
import { registerRoutes } from 'src/repositories/routes/repository-settings.routes';

const mockController = vi.hoisted(() => ({
  getRepositorySettings: vi.fn(),
  updateRepositorySettings: vi.fn(),
  deleteRepositorySettings: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: vi.fn(() => mockController),
  },
}));

describe('RepositorySettings Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should define the GET /:repositoryId/settings route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/:repositoryId/settings',
      mockController.getRepositorySettings,
    );
  });

  it('should define the PUT /:repositoryId/settings route', () => {
    registerRoutes();

    expect(router.put).toHaveBeenCalledWith(
      '/:repositoryId/settings',
      expect.any(Function),
      mockController.updateRepositorySettings,
    );
  });

  it('should define the DELETE /:repositoryId/settings route', () => {
    registerRoutes();

    expect(router.delete).toHaveBeenCalledWith(
      '/:repositoryId/settings',
      mockController.deleteRepositorySettings,
    );
  });
});
