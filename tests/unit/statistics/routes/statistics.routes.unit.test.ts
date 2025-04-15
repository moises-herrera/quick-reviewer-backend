import { Router } from 'express';
import { registerRoutes } from 'src/statistics/routes/statistics.routes';

const mockController = vi.hoisted(() => ({
  getPullRequestAverageCreationCountByRepository: vi.fn(),
  getPullRequestAverageCompletionTime: vi.fn(),
  getInitialReviewAverageTime: vi.fn(),
  getAverageReviewCount: vi.fn(),
  getPullRequestCountByRepository: vi.fn(),
  getReviewCountByRepository: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: vi.fn(() => mockController),
  },
}));

describe('Statistics Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should define the /pull-requests/average-creation-count-by-repository route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/pull-requests/average-creation-count-by-repository',
      expect.any(Function),
      mockController.getPullRequestAverageCreationCountByRepository,
    );
  });

  it('should define the /pull-requests/average-completion-time route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/pull-requests/average-completion-time',
      expect.any(Function),
      mockController.getPullRequestAverageCompletionTime,
    );
  });

  it('should define the /pull-requests/initial-review-average-time route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/pull-requests/initial-review-average-time',
      expect.any(Function),
      mockController.getInitialReviewAverageTime,
    );
  });

  it('should define the /pull-requests/average-review-count route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/pull-requests/average-review-count',
      expect.any(Function),
      mockController.getAverageReviewCount,
    );
  });

  it('should define the /pull-requests/count-by-repository route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/pull-requests/count-by-repository',
      expect.any(Function),
      mockController.getPullRequestCountByRepository,
    );
  });

  it('should define the /pull-requests/review-count-by-repository route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/pull-requests/review-count-by-repository',
      expect.any(Function),
      mockController.getReviewCountByRepository,
    );
  });
});
