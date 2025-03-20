import { Container } from 'inversify';
import { PostgresCodeReviewCommentRepository } from 'src/database/repositories/postgres-code-review-comment.repository';
import { PostgresCodeReviewRepository } from 'src/database/repositories/postgres-code-review.repository';
import { PostgresProjectRepository } from 'src/database/repositories/postgres-project.repository';
import { PostgresPullRequestCommentRepository } from 'src/database/repositories/postgres-pull-request-comment.repository';
import { PostgresPullRequestRepository } from 'src/database/repositories/postgres-pull-request.repository';
import { PostgresAccountRepository } from 'src/database/repositories/postgres-account.repository';
import { GitHubHistoryService } from 'src/github/services/github-history.service';
import { PostgresUserRepository } from 'src/database/repositories/postgres-user.repository';
import { GitHubRegisterUserService } from 'src/github/services/github-register-user.service';
import { AppStatisticsService } from 'src/statistics/services/app-statistics.service';
import { StatisticsController } from 'src/statistics/controllers/statistics.controller';
import { RepositoryController } from 'src/history/controllers/repository.controller';
import { CodeReviewController } from 'src/history/controllers/code-review.controller';
import { AnthropicAIService } from 'src/ai/services/anthropic-ai.service';
import { GitHubAIReviewService } from 'src/github/services/github-ai-review.service';
import { GitHubAuthController } from 'src/github/controllers/github-auth.controller';
import {
  EventHandlerFactory,
  Repositories,
  Services,
} from 'src/github/factories/event-handler-factory';
import { GitHubPullRequestService } from 'src/github/services/github-pull-request.service';
import { AccountController } from 'src/history/controllers/account.controller';
import { PullRequestController } from 'src/history/controllers/pull-request.controller';
import { AccountRepository } from 'src/core/repositories/account.repository';
import { CodeReviewCommentRepository } from 'src/core/repositories/code-review-comment.repository';
import { CodeReviewRepository } from 'src/core/repositories/code-review.repository';
import { ProjectRepository } from 'src/core/repositories/project.repository';
import { PullRequestCommentRepository } from 'src/core/repositories/pull-request-comment.repository';
import { UserRepository } from 'src/core/repositories/user-repository.interface';
import { PullRequestRepository } from 'src/core/repositories/pull-request.repository';
import { AIService } from 'src/core/services/ai.service';
import { HistoryService } from 'src/core/services/history.service';
import { RegisterUserService } from 'src/core/services/register-user.service';
import { StatisticsService } from 'src/core/services/statistics.service';
import { AIReviewService } from 'src/core/services/ai-review.service';
import { PullRequestService } from 'src/core/services/pull-request.service';
import { DbClient } from 'src/database/db-client';
import { TestAccountRepository } from 'src/core/repositories/test-account.repository';
import { PostgresTestAccountRepository } from 'src/database/repositories/postgres-test-account.repository';
import { LoggerService } from 'src/core/services/logger.service';
import { AppLoggerService } from 'src/common/services/app-logger.service';

export const container = new Container();

container.bind<DbClient>(DbClient).toSelf().inSingletonScope();
container
  .bind<LoggerService>(LoggerService)
  .to(AppLoggerService)
  .inSingletonScope();

// Repositories
container
  .bind<TestAccountRepository>(TestAccountRepository)
  .to(PostgresTestAccountRepository);
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
container.bind<HistoryService>(HistoryService).to(GitHubHistoryService);
container
  .bind<RegisterUserService>(RegisterUserService)
  .to(GitHubRegisterUserService);
container.bind<StatisticsService>(StatisticsService).to(AppStatisticsService);
container.bind<AIService>(AIService).to(AnthropicAIService);
container.bind<AIReviewService>(AIReviewService).to(GitHubAIReviewService);
container
  .bind<PullRequestService>(PullRequestService)
  .to(GitHubPullRequestService);

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
container.bind<Repositories>(Repositories).to(Repositories);
container.bind<Services>(Services).to(Services);
container
  .bind<EventHandlerFactory>(EventHandlerFactory)
  .to(EventHandlerFactory);
