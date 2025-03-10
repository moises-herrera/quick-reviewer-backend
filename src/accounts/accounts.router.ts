import { Router } from 'express';
import { AccountController } from './controllers/account.controller';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { RepositoryController } from './controllers/repository.controller';
import { PullRequestController } from './controllers/pull-request.controller';

const accountsRouter = Router();
const accountController = new AccountController();
const repositoryController = new RepositoryController();
const pullRequestController = new PullRequestController();

accountsRouter.use(gitHubAuthMiddleware);

accountsRouter.get(
  '/',
  accountController.getAllAccounts.bind(accountController),
);

accountsRouter.get(
  '/organizations',
  accountController.getOrganizations.bind(accountController),
);

accountsRouter.get(
  '/users',
  accountController.getUsers.bind(accountController),
);

accountsRouter.get(
  '/:ownerName/repositories',
  repositoryController.getRepositories.bind(repositoryController),
);

accountsRouter.get(
  '/:ownerName/repositories/:repositoryName/pull-requests',
  pullRequestController.getPullRequests.bind(pullRequestController),
);

accountsRouter.get(
  '/:ownerName/repositories/:repositoryName/pull-requests/:pullRequestNumber/reviews',
  pullRequestController.getPullRequestReviews.bind(pullRequestController),
);

export { accountsRouter };
