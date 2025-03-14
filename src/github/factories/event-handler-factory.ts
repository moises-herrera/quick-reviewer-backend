import { injectable, inject } from 'inversify';
import { InstallationHandler } from '../event-handlers/installation.handler';
import { InstallationRepositoriesHandler } from '../event-handlers/installation-repositories.handler';
import { AccountRepository } from '../repositories/account.repository';
import { ProjectRepository } from '../repositories/project-repository.repository';
import { HistoryService } from '../../history/services/history.service';
import { RepositoryHandler } from '../event-handlers/repository.handler';
import { PullRequestHandler } from '../event-handlers/pull-request.handler';
import { IssueCommentHandler } from '../event-handlers/issue-comment.handler';
import { PullRequestReviewHandler } from '../event-handlers/pull-request-review.handler';
import { PullRequestReviewCommentHandler } from '../event-handlers/pull-request-review-comment.handler';
import { PullRequestReviewThreadHandler } from '../event-handlers/pull-request-review-thread.handler';
import { PullRequestRepository } from '../repositories/pull-request.repository';
import { AIReviewService } from '../services/ai-review.service';
import { PullRequestCommentRepository } from '../repositories/pull-request-comment.repository';
import { CodeReviewRepository } from '../repositories/code-review.repository';
import { CodeReviewCommentRepository } from '../repositories/code-review-comment.repository';
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
export class GitHubRepositories {
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
  ) {}
}

@injectable()
export class GitHubServices {
  constructor(
    @inject(HistoryService) public readonly historyService: HistoryService,
    @inject(AIReviewService) public readonly aiReviewService: AIReviewService,
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
    @inject(GitHubRepositories)
    private readonly repositories: GitHubRepositories,
    @inject(GitHubServices) private readonly services: GitHubServices,
  ) {
    this.registerHandlers();
  }

  private registerHandlers() {
    // Register all handlers with their event types
    this.handlerCreators['installation'] = (event: InstallationEvent) =>
      new InstallationHandler(
        event,
        this.repositories.accountRepository,
        this.services.historyService,
      );

    this.handlerCreators['installation_repositories'] = (
      event: InstallationRepositoriesEvent,
    ) =>
      new InstallationRepositoriesHandler(
        event,
        this.repositories.projectRepository,
      );

    this.handlerCreators['repository'] = (event: RepositoryEvent) =>
      new RepositoryHandler(event, this.repositories.projectRepository);

    this.handlerCreators['pull_request'] = (event: PullRequestEvent) =>
      new PullRequestHandler(
        event,
        this.repositories.pullRequestRepository,
        this.services.aiReviewService,
      );

    this.handlerCreators['issue_comment'] = (event: IssueCommentEvent) =>
      new IssueCommentHandler(
        event,
        this.repositories.pullRequestRepository,
        this.repositories.pullRequestCommentRepository,
        this.services.aiReviewService,
      );

    this.handlerCreators['pull_request_review'] = (
      event: PullRequestReviewEvent,
    ) =>
      new PullRequestReviewHandler(
        event,
        this.repositories.codeReviewRepository,
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
