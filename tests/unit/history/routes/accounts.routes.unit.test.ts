import { Router } from 'express';
import { registerRoutes } from 'src/history/routes/accounts.routes';

const accountController = vi.hoisted(() => ({
  getAllAccounts: vi.fn(),
  getOrganizations: vi.fn(),
  getUsers: vi.fn(),
}));

const repositoryController = vi.hoisted(() => ({
  getRepositories: vi.fn(),
}));

const pullRequestController = vi.hoisted(() => ({
  getPullRequests: vi.fn(),
}));

const codeReviewController = vi.hoisted(() => ({
  getCodeReviews: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    get: (token: Function) => {
      if (token.name === 'AccountController') {
        return accountController;
      }

      if (token.name === 'RepositoryController') {
        return repositoryController;
      }

      if (token.name === 'PullRequestController') {
        return pullRequestController;
      }

      if (token.name === 'CodeReviewController') {
        return codeReviewController;
      }

      return {};
    },
  },
}));

describe('Accounts Routes', () => {
  let router: Router;

  beforeEach(() => {
    router = Router();
    vi.clearAllMocks();
  });

  it('should define the / route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/',
      accountController.getAllAccounts,
    );
  });

  it('should define the /organizations route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/organizations',
      accountController.getOrganizations,
    );
  });

  it('should define the /users route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/users',
      accountController.getUsers,
    );
  });

  it('should define the /:ownerName/repositories route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/:ownerName/repositories',
      repositoryController.getRepositories,
    );
  });

  it('should define the /:ownerName/repositories/:repositoryName/pull-requests route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/:ownerName/repositories/:repositoryName/pull-requests',
      pullRequestController.getPullRequests,
    );
  });

  it('should define the /:ownerName/repositories/:repositoryName/pull-requests/:pullRequestNumber/reviews route', () => {
    registerRoutes();

    expect(router.get).toHaveBeenCalledWith(
      '/:ownerName/repositories/:repositoryName/pull-requests/:pullRequestNumber/reviews',
      codeReviewController.getCodeReviews,
    );
  });
});
