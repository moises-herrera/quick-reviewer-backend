import { Container } from 'inversify';
import { PostgresCodeReviewCommentRepository } from 'src/common/database/repositories/postgres-code-review-comment.repository';
import { PostgresCodeReviewRepository } from 'src/common/database/repositories/postgres-code-review.repository';
import { PostgresProjectRepository } from 'src/common/database/repositories/postgres-project.repository';
import { PostgresPullRequestCommentRepository } from 'src/common/database/repositories/postgres-pull-request-comment.repository';
import { PostgresPullRequestRepository } from 'src/common/database/repositories/postgres-pull-request.repository';
import { PostgresAccountRepository } from 'src/common/database/repositories/postgres-account.repository';
import { GitHubHistoryService } from 'src/github/services/github-history.service';
import { PostgresUserRepository } from 'src/common/database/repositories/postgres-user.repository';
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
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { CodeReviewCommentRepository } from 'src/common/database/abstracts/code-review-comment.repository';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { PullRequestCommentRepository } from 'src/common/database/abstracts/pull-request-comment.repository';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { AIService } from 'src/ai/abstracts/ai.service';
import { HistoryService } from 'src/github/abstracts/history.abstract';
import { RegisterUserService } from 'src/github/abstracts/register-user.abstract';
import { StatisticsService } from 'src/statistics/abstracts/statistics.abstract';
import { AIReviewService } from 'src/github/abstracts/ai-review.abstract';
import { PullRequestService } from 'src/github/abstracts/pull-request.abstract';
import { DbClient } from 'src/common/database/db-client';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';
import { PostgresTestAccountRepository } from 'src/common/database/repositories/postgres-test-account.repository';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
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
