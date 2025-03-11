import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { AIReviewService } from '../services/reviewer.service';
import {
  REVIEW_PULL_REQUEST,
  SUMMARY_PULL_REQUEST,
} from '../constants/commands';
import { Octokit } from '../github-app';
import { PullRequestService } from '../services/pull-request.service';
import { ReviewParams } from '../interfaces/review-params';
import { PullRequest } from '@prisma/client';

type EventPayload = EmitterWebhookEvent<'issue_comment'>['payload'];

type IssueCommentEvent = GitHubWebHookEvent<EventPayload>;

export class IssueCommentHandler extends EventHandler<EventPayload> {
  private readonly pullRequestService = new PullRequestService();
  private readonly aiReviewService = new AIReviewService();

  constructor(event: IssueCommentEvent) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'created':
      case 'edited':
        await this.handleIssueComment(this.payload);
        break;

      default:
        break;
    }
  }

  private async handleIssueComment(
    payload:
      | EmitterWebhookEvent<'issue_comment.created'>['payload']
      | EmitterWebhookEvent<'issue_comment.edited'>['payload'],
  ): Promise<void> {
    const pullRequestFound = await this.pullRequestService.getPullRequestById(
      payload.issue.node_id,
    );

    if (!pullRequestFound) {
      console.error('Pull request not found');
      return;
    }

    switch (payload.comment.body) {
      case SUMMARY_PULL_REQUEST: {
        const summaryParams: ReviewParams = {
          pullRequest: pullRequestFound as PullRequest,
          repository: {
            name: payload.repository.name,
            owner: payload.repository.owner.login,
          },
          includeFileComments: false,
        };
        await this.aiReviewService.generatePullRequestReview(
          this.octokit as Octokit,
          summaryParams,
        );
        break;
      }

      case REVIEW_PULL_REQUEST: {
        const reviewParams: ReviewParams = {
          pullRequest: pullRequestFound as PullRequest,
          repository: {
            name: payload.repository.name,
            owner: payload.repository.owner.login,
          },
          includeFileComments: true,
        };
        await this.aiReviewService.generatePullRequestReview(
          this.octokit as Octokit,
          reviewParams,
        );
      }
    }
  }
}
