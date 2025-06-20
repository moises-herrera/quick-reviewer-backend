import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from 'src/github/interfaces/event-handler';
import {
  REVIEW_PULL_REQUEST_COMMAND,
  SUMMARIZE_PULL_REQUEST_COMMAND,
} from 'src/github/constants/commands';
import { Octokit } from 'src/github/interfaces/octokit';
import { AIReviewParams } from 'src/common/interfaces/review-params';
import { PullRequest, PullRequestComment } from '@prisma/client';
import { BOT_USER_REFERENCE, BOT_USERNAME } from 'src/github/constants/bot';
import { PullRequestCommentMapper } from 'src/github/mappers/pull-request-comment.mapper';
import { IssueCommentEvent } from 'src/github/interfaces/events';
import { PullRequestCommentRepository } from 'src/common/database/abstracts/pull-request-comment.repository';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { AIReviewService } from 'src/common/abstracts/ai-review.abstract';
import { PullRequestMapper } from 'src/github/mappers/pull-request.mapper';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { BotSettingsService } from 'src/common/abstracts/bot-settings.abstract';

export class IssueCommentHandler extends EventHandler<
  IssueCommentEvent['payload']
> {
  constructor(
    event: IssueCommentEvent,
    private readonly pullRequestRepository: PullRequestRepository,
    private readonly pullRequestCommentRepository: PullRequestCommentRepository,
    private readonly aiReviewService: AIReviewService,
    private readonly loggerService: LoggerService,
    private readonly botSettingsService: BotSettingsService,
  ) {
    super(event);

    this.aiReviewService.setGitProvider(this.octokit as Octokit);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'created':
        await this.handleIssueCommentCreated(this.payload);
        break;

      case 'edited':
        await this.handleIssueCommentEdited(this.payload);
        break;

      case 'deleted':
        await this.handleIssueCommentDeleted(this.payload);
        break;

      default:
        break;
    }
  }

  private async handleComment(
    payload:
      | EmitterWebhookEvent<'issue_comment.created'>['payload']
      | EmitterWebhookEvent<'issue_comment.edited'>['payload'],
    pullRequest: PullRequest,
  ): Promise<void> {
    if (
      !payload.comment.body.includes(BOT_USERNAME) ||
      payload.comment.user?.login === BOT_USERNAME
    ) {
      return;
    }

    if (!payload.issue.pull_request) {
      this.loggerService.logException('Not a pull request comment');
      return;
    }

    const reviewParams: AIReviewParams = {
      pullRequest,
      repository: {
        name: payload.repository.name,
        owner: payload.repository.owner.login,
      },
    };

    if (payload.comment.body === SUMMARIZE_PULL_REQUEST_COMMAND) {
      await this.aiReviewService.generatePullRequestSummary(reviewParams);
    } else if (payload.comment.body === REVIEW_PULL_REQUEST_COMMAND) {
      const settings = await this.botSettingsService.getSettings(
        payload.repository.owner.id.toString(),
        payload.repository.id.toString(),
      );

      await this.aiReviewService.generatePullRequestReview({
        ...reviewParams,
        settings,
      });
    }
  }

  private async getPullRequestFromPayload(
    payload:
      | EmitterWebhookEvent<'issue_comment.created'>['payload']
      | EmitterWebhookEvent<'issue_comment.edited'>['payload'],
  ): Promise<PullRequest> {
    let pullRequest = await this.pullRequestRepository.getPullRequestById(
      payload.issue.node_id,
    );

    if (!pullRequest) {
      const { data } = await (this.octokit as Octokit).rest.pulls.get({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        pull_number: payload.issue.number,
      });
      pullRequest = await this.pullRequestRepository.savePullRequest(
        PullRequestMapper.mapPullRequestWithRepository({
          pullRequest: data,
          repositoryId: payload.repository.id,
        }),
      );
    }

    return pullRequest;
  }

  private async handleIssueCommentCreated(
    payload: EmitterWebhookEvent<'issue_comment.created'>['payload'],
  ): Promise<void> {
    try {
      if (payload.comment.user?.login === BOT_USER_REFERENCE) {
        return;
      }

      const pullRequest = await this.getPullRequestFromPayload(payload);

      await this.handleComment(payload, pullRequest);

      await this.pullRequestCommentRepository.savePullRequestComment({
        ...PullRequestCommentMapper.mapPullRequestComment(payload.comment),
        pullRequestId: pullRequest.id,
      } as PullRequestComment);
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error handling issue comment created',
      });
    }
  }

  private async handleIssueCommentEdited(
    payload: EmitterWebhookEvent<'issue_comment.edited'>['payload'],
  ): Promise<void> {
    try {
      if (payload.comment.user?.login === BOT_USER_REFERENCE) {
        return;
      }

      const pullRequest = await this.getPullRequestFromPayload(payload);

      await this.handleComment(payload, pullRequest);

      await this.pullRequestCommentRepository.updatePullRequestComment(
        payload.comment.id.toString(),
        {
          body: payload.comment.body,
        },
      );
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error handling issue comment edited',
      });
    }
  }

  private async handleIssueCommentDeleted({
    comment,
  }: EmitterWebhookEvent<'issue_comment.deleted'>['payload']): Promise<void> {
    try {
      await this.pullRequestCommentRepository.deletePullRequestComment(
        comment.id.toString(),
      );
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error handling issue comment deleted',
      });
    }
  }
}
