import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { AIReviewService } from '../services/ai-review.service';
import {
  REVIEW_PULL_REQUEST_COMMAND,
  SUMMARIZE_PULL_REQUEST_COMMAND,
} from '../constants/commands';
import { Octokit } from '../interfaces/octokit';
import { PullRequestRepository } from '../repositories/pull-request.repository';
import { AIReviewParams } from '../interfaces/review-params';
import { PullRequest, PullRequestComment } from '@prisma/client';
import { BOT_USER_REFERENCE, BOT_USERNAME } from '../constants/bot';
import { PullRequestCommentRepository } from '../repositories/pull-request-comment.repository';
import { mapPullRequestComment } from '../mappers/pull-request-comment.mapper';
import { IssueCommentEvent } from '../interfaces/events';

export class IssueCommentHandler extends EventHandler<
  IssueCommentEvent['payload']
> {
  constructor(
    event: IssueCommentEvent,
    private readonly pullRequestRepository: PullRequestRepository,
    private readonly pullRequestCommentRepository: PullRequestCommentRepository,
    private readonly aiReviewService: AIReviewService,
  ) {
    super(event);
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
      console.error('Not a pull request comment');
      return;
    }

    const defaultParams: AIReviewParams = {
      pullRequest,
      repository: {
        name: payload.repository.name,
        owner: payload.repository.owner.login,
      },
    };

    if (payload.comment.body === SUMMARIZE_PULL_REQUEST_COMMAND) {
      await this.aiReviewService.generatePullRequestSummary(
        this.octokit as Octokit,
        { ...defaultParams, fullReview: true, includeFileContents: true },
      );
    } else if (payload.comment.body === REVIEW_PULL_REQUEST_COMMAND) {
      await this.aiReviewService.generatePullRequestReview(
        this.octokit as Octokit,
        defaultParams,
      );
    }
  }

  private async handleIssueCommentCreated(
    payload: EmitterWebhookEvent<'issue_comment.created'>['payload'],
  ): Promise<void> {
    try {
      const pullRequest = await this.pullRequestRepository.getPullRequestById(
        payload.issue.node_id,
      );

      if (!pullRequest) {
        console.error('Pull request not found');
        return;
      }

      await this.handleComment(payload, pullRequest);

      if (payload.comment.user?.login === BOT_USER_REFERENCE) {
        return;
      }

      await this.pullRequestCommentRepository.savePullRequestComment({
        ...mapPullRequestComment(payload.comment),
        pullRequestId: pullRequest.id,
      } as PullRequestComment);
    } catch (error) {
      console.error('Error handling issue comment created:', error);
    }
  }

  private async handleIssueCommentEdited(
    payload: EmitterWebhookEvent<'issue_comment.edited'>['payload'],
  ): Promise<void> {
    try {
      const pullRequest = await this.pullRequestRepository.getPullRequestById(
        payload.issue.node_id,
      );

      if (!pullRequest) {
        console.error('Pull request not found');
        return;
      }

      await this.handleComment(payload, pullRequest);

      if (payload.comment.user?.login === BOT_USER_REFERENCE) {
        return;
      }

      await this.pullRequestCommentRepository.updatePullRequestComment(
        payload.comment.id as unknown as bigint,
        mapPullRequestComment(payload.comment),
      );
    } catch (error) {
      console.error('Error handling issue comment edited:', error);
    }
  }

  private async handleIssueCommentDeleted(
    payload: EmitterWebhookEvent<'issue_comment.deleted'>['payload'],
  ): Promise<void> {
    try {
      await this.pullRequestCommentRepository.deletePullRequestComment(
        payload.comment.id as unknown as bigint,
      );
    } catch (error) {
      console.error('Error handling issue comment deleted:', error);
    }
  }
}
