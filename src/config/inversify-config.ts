import { Container } from 'inversify';
import { CodeReviewCommentRepository } from 'src/database/repositories/code-review-comment.repository';
import { CodeReviewRepository } from 'src/database/repositories/code-review.repository';
import { ProjectRepository } from 'src/database/repositories/project-repository.repository';
import { PullRequestCommentRepository } from 'src/database/repositories/pull-request-comment.repository';
import { PullRequestRepository } from 'src/database/repositories/pull-request.repository';
import { AccountRepository } from 'src/database/repositories/account.repository';
import { GitHubHistoryService } from 'src/github/services/github-history.service';
import { UserRepository } from 'src/database/repositories/user.repository';
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

export const container = new Container();

// Repositories
container.bind<AccountRepository>(AccountRepository).toSelf();
container.bind<ProjectRepository>(ProjectRepository).toSelf();
container.bind<PullRequestRepository>(PullRequestRepository).toSelf();
container
  .bind<PullRequestCommentRepository>(PullRequestCommentRepository)
  .toSelf();
container.bind<CodeReviewRepository>(CodeReviewRepository).toSelf();
container
  .bind<CodeReviewCommentRepository>(CodeReviewCommentRepository)
  .toSelf();
container.bind<UserRepository>(UserRepository).toSelf();

// Services
container.bind<PullRequestService>(PullRequestService).toSelf();
container.bind<GitHubHistoryService>(GitHubHistoryService).toSelf();
container.bind<RegisterUserService>(RegisterUserService).toSelf();
container.bind<StatisticsService>(StatisticsService).toSelf();
container.bind<AIService>(AIService).toSelf();
container.bind<AIReviewService>(AIReviewService).toSelf();

// Controllers
container.bind<GitHubAuthController>(GitHubAuthController).toSelf();
container.bind<AccountController>(AccountController).toSelf();
container.bind<RepositoryController>(RepositoryController).toSelf();
container.bind<PullRequestController>(PullRequestController).toSelf();
container.bind<CodeReviewController>(CodeReviewController).toSelf();
container.bind<StatisticsController>(StatisticsController).toSelf();

// Factories
container.bind(GitHubRepositories).to(GitHubRepositories);
container.bind(GitHubServices).to(GitHubServices);
container.bind<EventHandlerFactory>(EventHandlerFactory).toSelf();
