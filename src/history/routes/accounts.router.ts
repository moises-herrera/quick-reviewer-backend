import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { RepositoryController } from '../controllers/repository.controller';
import { PullRequestController } from '../controllers/pull-request.controller';
import { CodeReviewController } from '../controllers/code-review.controller';
import { container } from 'src/config/inversify-config';

const accountsRouter = Router();
const accountController = container.get(AccountController);
const repositoryController = container.get(RepositoryController);
const pullRequestController = container.get(PullRequestController);
const codeReviewController = container.get(CodeReviewController);

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
