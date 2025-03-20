import { injectable, inject } from 'inversify';
import { InstallationHandler } from '../event-handlers/installation.handler';
import { InstallationRepositoriesHandler } from '../event-handlers/installation-repositories.handler';
import { RepositoryHandler } from '../event-handlers/repository.handler';
import { PullRequestHandler } from '../event-handlers/pull-request.handler';
import { IssueCommentHandler } from '../event-handlers/issue-comment.handler';
import { PullRequestReviewHandler } from '../event-handlers/pull-request-review.handler';
import { PullRequestReviewCommentHandler } from '../event-handlers/pull-request-review-comment.handler';
import { PullRequestReviewThreadHandler } from '../event-handlers/pull-request-review-thread.handler';
import {
  InstallationEvent,
  InstallationRepositoriesEvent,
  RepositoryEvent,
  PullRequestEvent,
  IssueCommentEvent,
  PullRequestReviewEvent,
  PullRequestReviewCommentEvent,
  PullRequestReviewThreadEvent,
} from '../interfaces/events';
import { EventHandler } from '../interfaces/event-handler';
import { AccountRepository } from 'src/core/repositories/account.repository';
import { PullRequestRepository } from 'src/core/repositories/pull-request.repository';
import { ProjectRepository } from 'src/core/repositories/project.repository';
import { PullRequestCommentRepository } from 'src/core/repositories/pull-request-comment.repository';
import { CodeReviewCommentRepository } from 'src/core/repositories/code-review-comment.repository';
import { CodeReviewRepository } from 'src/core/repositories/code-review.repository';
import { HistoryService } from 'src/core/services/history.service';
import { AIReviewService } from 'src/core/services/ai-review.service';
import { TestAccountRepository } from 'src/core/repositories/test-account.repository';
import { LoggerService } from 'src/core/services/logger.service';

type EventTypeMap = {
  installation: InstallationEvent;
  installation_repositories: InstallationRepositoriesEvent;
  repository: RepositoryEvent;
  pull_request: PullRequestEvent;
  issue_comment: IssueCommentEvent;
  pull_request_review: PullRequestReviewEvent;
  pull_request_review_comment: PullRequestReviewCommentEvent;
  pull_request_review_thread: PullRequestReviewThreadEvent;
};

@injectable()
export class Repositories {
  constructor(
    @inject(AccountRepository)
    public readonly accountRepository: AccountRepository,
    @inject(ProjectRepository)
    public readonly projectRepository: ProjectRepository,
    @inject(PullRequestRepository)
    public readonly pullRequestRepository: PullRequestRepository,
    @inject(PullRequestCommentRepository)
    public readonly pullRequestCommentRepository: PullRequestCommentRepository,
    @inject(CodeReviewRepository)
    public readonly codeReviewRepository: CodeReviewRepository,
    @inject(CodeReviewCommentRepository)
    public readonly codeReviewCommentRepository: CodeReviewCommentRepository,
    @inject(TestAccountRepository)
    public readonly testAccountRepository: TestAccountRepository,
  ) {}
}

@injectable()
export class Services {
  constructor(
    @inject(HistoryService)
    public readonly historyService: HistoryService,
    @inject(AIReviewService) public readonly aiReviewService: AIReviewService,
    @inject(LoggerService) public readonly loggerService: LoggerService,
  ) {}
}

@injectable()
export class EventHandlerFactory {
  private handlerCreators: {
    [K in keyof EventTypeMap]?: (
      event: EventTypeMap[K],
    ) => EventHandler<EventTypeMap[K]['payload']>;
  } = {};

  constructor(
    @inject(Repositories)
    private readonly repositories: Repositories,
    @inject(Services) private readonly services: Services,
  ) {
    this.registerHandlers();
  }

  private registerHandlers() {
    // Register all handlers with their event types
    this.handlerCreators['installation'] = (event: InstallationEvent) =>
      new InstallationHandler(
        event,
        this.repositories.accountRepository,
        this.repositories.testAccountRepository,
        this.services.historyService,
        this.services.loggerService,
      );

    this.handlerCreators['installation_repositories'] = (
      event: InstallationRepositoriesEvent,
    ) =>
      new InstallationRepositoriesHandler(
        event,
        this.repositories.projectRepository,
      );

    this.handlerCreators['repository'] = (event: RepositoryEvent) =>
      new RepositoryHandler(
        event,
        this.repositories.projectRepository,
        this.services.loggerService,
      );

    this.handlerCreators['pull_request'] = (event: PullRequestEvent) =>
      new PullRequestHandler(
        event,
        this.repositories.pullRequestRepository,
        this.services.aiReviewService,
        this.services.loggerService,
      );

    this.handlerCreators['issue_comment'] = (event: IssueCommentEvent) =>
      new IssueCommentHandler(
        event,
        this.repositories.pullRequestRepository,
        this.repositories.pullRequestCommentRepository,
        this.services.aiReviewService,
        this.services.loggerService,
      );

    this.handlerCreators['pull_request_review'] = (
      event: PullRequestReviewEvent,
    ) =>
      new PullRequestReviewHandler(
        event,
        this.repositories.codeReviewRepository,
        this.services.loggerService,
      );

    this.handlerCreators['pull_request_review_comment'] = (
      event: PullRequestReviewCommentEvent,
    ) =>
      new PullRequestReviewCommentHandler(
        event,
        this.repositories.codeReviewCommentRepository,
      );

    this.handlerCreators['pull_request_review_thread'] = (
      event: PullRequestReviewThreadEvent,
    ) =>
      new PullRequestReviewThreadHandler(
        event,
        this.repositories.codeReviewCommentRepository,
      );
  }

  createHandler<K extends keyof EventTypeMap>(
    type: K,
    event: EventTypeMap[K],
  ): EventHandler<EventTypeMap[K]['payload']> {
    const creator = this.handlerCreators[type];
    if (!creator) {
      throw new Error(`No handler registered for event type: ${type}`);
    }
    return creator(event);
  }
}
