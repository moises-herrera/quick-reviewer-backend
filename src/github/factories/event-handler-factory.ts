import { injectable, inject } from 'inversify';
import { InstallationHandler } from 'src/github/event-handlers/installation.handler';
import { InstallationRepositoriesHandler } from 'src/github/event-handlers/installation-repositories.handler';
import { RepositoryHandler } from 'src/github/event-handlers/repository.handler';
import { PullRequestHandler } from 'src/github/event-handlers/pull-request.handler';
import { IssueCommentHandler } from 'src/github/event-handlers/issue-comment.handler';
import { PullRequestReviewHandler } from 'src/github/event-handlers/pull-request-review.handler';
import { PullRequestReviewCommentHandler } from 'src/github/event-handlers/pull-request-review-comment.handler';
import { PullRequestReviewThreadHandler } from 'src/github/event-handlers/pull-request-review-thread.handler';
import {
  InstallationEvent,
  InstallationRepositoriesEvent,
  RepositoryEvent,
  PullRequestEvent,
  IssueCommentEvent,
  PullRequestReviewEvent,
  PullRequestReviewCommentEvent,
  PullRequestReviewThreadEvent,
} from 'src/github/interfaces/events';
import { EventHandler } from 'src/github/interfaces/event-handler';
import { Repositories, Services } from 'src/github/factories/utils';

export type EventTypeMap = {
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
        this.services.loggerService,
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
        this.services.botSettingsService,
      );

    this.handlerCreators['issue_comment'] = (event: IssueCommentEvent) =>
      new IssueCommentHandler(
        event,
        this.repositories.pullRequestRepository,
        this.repositories.pullRequestCommentRepository,
        this.services.aiReviewService,
        this.services.loggerService,
        this.services.botSettingsService,
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
