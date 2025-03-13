import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { RepositoryController } from '../controllers/repository.controller';
import { PullRequestController } from '../controllers/pull-request.controller';
import { CodeReviewController } from '../controllers/code-review.controller';

const accountsRouter = Router();
const accountController = new AccountController();
const repositoryController = new RepositoryController();
const pullRequestController = new PullRequestController();
const codeReviewController = new CodeReviewController();

accountsRouter.get('/', accountController.getAllAccounts);

accountsRouter.get('/organizations', accountController.getOrganizations);

accountsRouter.get('/users', accountController.getUsers);

accountsRouter.get(
  '/:ownerName/repositories',
  repositoryController.getRepositories,
);

accountsRouter.get(
  '/:ownerName/repositories/:repositoryName/pull-requests',
  pullRequestController.getPullRequests,
);

accountsRouter.get(
  '/:ownerName/repositories/:repositoryName/pull-requests/:pullRequestNumber/reviews',
  codeReviewController.getCodeReviewsReviews,
);

export { accountsRouter };
