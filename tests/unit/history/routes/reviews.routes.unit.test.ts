import { Router } from 'express';
import { registerRoutes } from 'src/history/routes/reviews.routes';

const mockCodeReviewController = vi.hoisted(() => ({
  getCodeReviewsDetailedInfo: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: () => mockCodeReviewController,
  },
}));

describe('Reviews Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should define the / route', () => {
    registerRoutes();

    expect(router.post).toHaveBeenCalledWith(
      '/',
      expect.any(Function),
      mockCodeReviewController.getCodeReviewsDetailedInfo,
    );
  });
});
