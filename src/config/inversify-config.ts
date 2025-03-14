import { Container } from 'inversify';
import { PostgresCodeReviewCommentRepository } from 'src/database/repositories/postgres-code-review-comment.repository';
import { PostgresCodeReviewRepository } from 'src/database/repositories/postgres-code-review.repository';
import { PostgresProjectRepository } from 'src/database/repositories/postgres-project.repository';
import { PostgresPullRequestCommentRepository } from 'src/database/repositories/postgres-pull-request-comment.repository';
import { PostgresPullRequestRepository } from 'src/database/repositories/postgres-pull-request.repository';
import { PostgresAccountRepository } from 'src/database/repositories/postgres-account.repository';
import { GitHubHistoryService } from 'src/github/services/github-history.service';
import { PostgresUserRepository } from 'src/database/repositories/postgres-user.repository';
import { RegisterUserService } from 'src/github/services/register-user.service';
import { StatisticsService } from 'src/statistics/services/statistics.service';
import { StatisticsController } from 'src/statistics/controllers/statistics.controller';
import { RepositoryController } from 'src/history/controllers/repository.controller';
import { CodeReviewController } from 'src/history/controllers/code-review.controller';
import { AIService } from 'src/ai/services/ai.service';
import { AIReviewService } from 'src/github/services/ai-review.service';
import { GitHubAuthController } from 'src/github/controllers/github-auth.controller';
import {
  EventHandlerFactory,
  GitHubRepositories,
  GitHubServices,
} from 'src/github/factories/event-handler-factory';
import { PullRequestService } from 'src/github/services/pull-request.service';
import { AccountController } from 'src/history/controllers/account.controller';
import { PullRequestController } from 'src/history/controllers/pull-request.controller';
import { AccountRepository } from 'src/core/repositories/account.repository';
import { CodeReviewCommentRepository } from 'src/core/repositories/code-review-comment.repository';
import { CodeReviewRepository } from 'src/core/repositories/code-review.repository';
import { ProjectRepository } from 'src/core/repositories/project.repository';
import { PullRequestCommentRepository } from 'src/core/repositories/pull-request-comment.repository';
import { UserRepository } from 'src/core/repositories/user-repository.interface';
import { PullRequestRepository } from 'src/core/repositories/pull-request.repository';

export const container = new Container();

// Repositories
container
  .bind<AccountRepository>(AccountRepository)
  .to(PostgresAccountRepository);
container
  .bind<CodeReviewCommentRepository>(CodeReviewCommentRepository)
  .to(PostgresCodeReviewCommentRepository);
container
  .bind<ProjectRepository>(ProjectRepository)
  .to(PostgresProjectRepository);
container
  .bind<PullRequestRepository>(PullRequestRepository)
  .to(PostgresPullRequestRepository);
container
  .bind<PullRequestCommentRepository>(PullRequestCommentRepository)
  .to(PostgresPullRequestCommentRepository);
container
  .bind<CodeReviewRepository>(CodeReviewRepository)
  .to(PostgresCodeReviewRepository);
container.bind<UserRepository>(UserRepository).to(PostgresUserRepository);

// Services
container
  .bind<GitHubHistoryService>(GitHubHistoryService)
  .to(GitHubHistoryService);
container
  .bind<RegisterUserService>(RegisterUserService)
  .to(RegisterUserService);
container.bind<StatisticsService>(StatisticsService).to(StatisticsService);
container.bind<AIService>(AIService).to(AIService);
container.bind<AIReviewService>(AIReviewService).to(AIReviewService);
container.bind<PullRequestService>(PullRequestService).to(PullRequestService);

// Controllers
container
  .bind<GitHubAuthController>(GitHubAuthController)
  .to(GitHubAuthController);
container.bind<AccountController>(AccountController).to(AccountController);
container
  .bind<RepositoryController>(RepositoryController)
  .to(RepositoryController);
container
  .bind<PullRequestController>(PullRequestController)
  .to(PullRequestController);
container
  .bind<CodeReviewController>(CodeReviewController)
  .to(CodeReviewController);
container
  .bind<StatisticsController>(StatisticsController)
  .to(StatisticsController);

// Factories
container.bind<GitHubRepositories>(GitHubRepositories).to(GitHubRepositories);
container.bind<GitHubServices>(GitHubServices).to(GitHubServices);
container
  .bind<EventHandlerFactory>(EventHandlerFactory)
  .to(EventHandlerFactory);
