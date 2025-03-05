import { Router } from 'express';
import { AccountController } from './controllers/account.controller';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { RepositoryController } from './controllers/repository.controller';
import { PullRequestController } from './controllers/pull-request.controller';

const analyticsRouter = Router();
const accountController = new AccountController();
const repositoryController = new RepositoryController();
const pullRequestController = new PullRequestController();

analyticsRouter.get(
  '/accounts/organizations',
  gitHubAuthMiddleware,
  accountController.getOrganizations.bind(accountController),
);

analyticsRouter.get(
  '/accounts/users',
  gitHubAuthMiddleware,
  accountController.getUsers.bind(accountController),
);

analyticsRouter.get(
  '/accounts/:ownerId/repositories',
  gitHubAuthMiddleware,
  repositoryController.getRepositories.bind(repositoryController),
);

analyticsRouter.get(
  '/accounts/:ownerId/repositories/:repositoryId/pull-requests',
  gitHubAuthMiddleware,
  pullRequestController.getPullRequests.bind(pullRequestController),
);

analyticsRouter.get(
  '/accounts/:ownerId/repositories/:repositoryId/pull-requests/:pullRequestId/reviews',
  gitHubAuthMiddleware,
  pullRequestController.getPullRequestReviews.bind(pullRequestController),
)

export { analyticsRouter };
