import { Router } from 'express';
import { AccountController } from './controllers/account.controller';
import { RepositoryController } from './controllers/repository.controller';
import { PullRequestController } from './controllers/pull-request.controller';
import { CodeReviewController } from './controllers/code-review.controller';

const accountsRouter = Router();
const accountController = new AccountController();
const repositoryController = new RepositoryController();
const pullRequestController = new PullRequestController();
const codeReviewController = new CodeReviewController();

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
  codeReviewController.getCodeReviewsReviews.bind(codeReviewController),
);

export { accountsRouter };
