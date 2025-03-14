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

@injectable()
export class EventHandlerFactory {
  constructor(
    @inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
    @inject(PullRequestRepository)
    private readonly pullRequestRepository: PullRequestRepository,
    @inject(PullRequestCommentRepository)
    private readonly pullRequestCommentRepository: PullRequestCommentRepository,
    @inject(CodeReviewRepository)
    private readonly codeReviewRepository: CodeReviewRepository,
    @inject(CodeReviewCommentRepository)
    private readonly codeReviewCommentRepository: CodeReviewCommentRepository,
    @inject(HistoryService) private readonly historyService: HistoryService,
    @inject(AIReviewService)
    private readonly aiReviewService: AIReviewService,
  ) {}

  createInstallationHandler(event: InstallationEvent): InstallationHandler {
    return new InstallationHandler(
      event,
      this.accountRepository,
      this.historyService,
    );
  }

  createInstallationRepositoriesHandler(
    event: InstallationRepositoriesEvent,
  ): InstallationRepositoriesHandler {
    return new InstallationRepositoriesHandler(event, this.projectRepository);
  }

  createRepositoryHandler(event: RepositoryEvent): RepositoryHandler {
    return new RepositoryHandler(event, this.projectRepository);
  }

  createPullRequestHandler(event: PullRequestEvent): PullRequestHandler {
    return new PullRequestHandler(
      event,
      this.pullRequestRepository,
      this.aiReviewService,
    );
  }

  createIssueCommentHandler(event: IssueCommentEvent): IssueCommentHandler {
    return new IssueCommentHandler(
      event,
      this.pullRequestRepository,
      this.pullRequestCommentRepository,
      this.aiReviewService,
    );
  }

  createPullRequestReviewHandler(
    event: PullRequestReviewEvent,
  ): PullRequestReviewHandler {
    return new PullRequestReviewHandler(event, this.codeReviewRepository);
  }

  createPullRequestReviewCommentHandler(
    event: PullRequestReviewCommentEvent,
  ): PullRequestReviewCommentHandler {
    return new PullRequestReviewCommentHandler(
      event,
      this.codeReviewCommentRepository,
    );
  }

  createPullRequestReviewThreadHandler(
    event: PullRequestReviewThreadEvent,
  ): PullRequestReviewThreadHandler {
    return new PullRequestReviewThreadHandler(
      event,
      this.codeReviewCommentRepository,
    );
  }
}
