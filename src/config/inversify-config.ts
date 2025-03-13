import { Container } from 'inversify';
import { AccountRepository } from 'src/github/interfaces/repositories/account.repository';
import { AppAccountRepository } from 'src/github/repositories/app-account.repository';
import { CodeReviewCommentRepository } from 'src/github/repositories/code-review-comment.repository';
import { CodeReviewRepository } from 'src/github/repositories/code-review.repository';
import { ProjectRepository } from 'src/github/repositories/project-repository.repository';
import { PullRequestCommentRepository } from 'src/github/repositories/pull-request-comment.repository';
import { PullRequestRepository } from 'src/github/repositories/pull-request.repository';

const container = new Container();
export const CONTAINER_SYMBOL = Symbol.for('Container');

container.bind(CONTAINER_SYMBOL).toConstantValue(container);

container.bind(AccountRepository).to(AppAccountRepository);
container.bind<ProjectRepository>(ProjectRepository).toSelf();
container.bind<PullRequestRepository>(PullRequestRepository).toSelf();
container
  .bind<PullRequestCommentRepository>(PullRequestCommentRepository)
  .toSelf();
container.bind<CodeReviewRepository>(CodeReviewRepository).toSelf();
container
  .bind<CodeReviewCommentRepository>(CodeReviewCommentRepository)
  .toSelf();
