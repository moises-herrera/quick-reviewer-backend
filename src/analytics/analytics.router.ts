import { Router } from 'express';
import { AccountController } from './controllers/account.controller';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { RepositoryController } from './controllers/repository.controller';
import { PullRequestController } from './controllers/pull-request.controller';

const analyticsRouter = Router();
const accountController = new AccountController();
const repositoryController = new RepositoryController();
const pullRequestController = new PullRequestController();

analyticsRouter.use(gitHubAuthMiddleware);

analyticsRouter.get(
  '/accounts/organizations',
  accountController.getOrganizations.bind(accountController),
);

analyticsRouter.get(
  '/accounts/users',
  accountController.getUsers.bind(accountController),
);

analyticsRouter.get(
  '/accounts/:ownerName/repositories',
  repositoryController.getRepositories.bind(repositoryController),
);

analyticsRouter.get(
  '/accounts/:ownerName/repositories/:repositoryName/pull-requests',
  pullRequestController.getPullRequests.bind(pullRequestController),
);

analyticsRouter.get(
  '/accounts/:ownerName/repositories/:repositoryName/pull-requests/:pullRequestNumber/reviews',
  pullRequestController.getPullRequestReviews.bind(pullRequestController),
);

export { analyticsRouter };
