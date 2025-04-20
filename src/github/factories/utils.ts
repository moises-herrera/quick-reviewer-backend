import { injectable, inject } from 'inversify';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { PullRequestCommentRepository } from 'src/common/database/abstracts/pull-request-comment.repository';
import { CodeReviewCommentRepository } from 'src/common/database/abstracts/code-review-comment.repository';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { HistoryService } from 'src/common/abstracts/history.abstract';
import { AIReviewService } from 'src/common/abstracts/ai-review.abstract';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { BotSettingsService } from 'src/common/abstracts/bot-settings.abstract';

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
    @inject(AIReviewService)
    public readonly aiReviewService: AIReviewService,
    @inject(LoggerService)
    public readonly loggerService: LoggerService,
    @inject(BotSettingsService)
    public readonly botSettingsService: BotSettingsService,
  ) {}
}
