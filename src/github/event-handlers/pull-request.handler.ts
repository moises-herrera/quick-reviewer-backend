import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { mapPullRequestWithRepository } from '../mappers/pull-request.mapper';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { PullRequestRepository } from '../repositories/pull-request.repository';
import { AIReviewService } from '../services/ai-review.service';
import { Octokit } from '../interfaces/octokit';
import { AIReviewParams } from '../interfaces/review-params';

type EventPayload = EmitterWebhookEvent<'pull_request'>['payload'];

type PullRequestEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestHandler extends EventHandler<EventPayload> {
  private readonly pullRequestService = new PullRequestRepository();
  private readonly aiReviewService = new AIReviewService();

  constructor(event: PullRequestEvent) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'opened':
        await this.handlePullRequestCreation(this.payload);
        break;

      case 'edited':
        await this.handlePullRequestUpdate(this.payload);
        break;

      case 'closed':
        await this.handlePullRequestClosure(this.payload);
        break;

      case 'reopened':
        await this.handlePullRequestReopening(this.payload);
        break;

      case 'synchronize':
        await this.handlePullRequestSynchronization(this.payload);
        break;

      case 'ready_for_review':
        await this.handlePullRequestReadyForReview(this.payload);
        break;

      default:
        break;
    }
  }

  private async handlePullRequestCreation(
    payload: EmitterWebhookEvent<'pull_request.opened'>['payload'],
  ): Promise<void> {
    try {
      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: payload.pull_request,
        repository: payload.repository,
      });

      if (!payload.pull_request.draft) {
        const reviewParams: AIReviewParams = {
          pullRequest: pullRequestMapped,
          repository: {
            name: payload.repository.name,
            owner: payload.repository.owner.login,
          },
          includeFileContents: true,
        };
        await this.aiReviewService.generatePullRequestSummary(
          this.octokit as Octokit,
          reviewParams,
        );

        await this.aiReviewService.generatePullRequestReview(
          this.octokit as Octokit,
          reviewParams,
        );
      }

      await this.pullRequestService.savePullRequest(pullRequestMapped);
    } catch (error) {
      console.error('Error creating pull request:', error);
    }
  }

  private async handlePullRequestUpdate({
    pull_request,
    repository,
  }: EmitterWebhookEvent<'pull_request.edited'>['payload']): Promise<void> {
    try {
      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: pull_request,
        repository: repository,
      });
      await this.pullRequestService.updatePullRequest(pull_request.id, {
        state: pullRequestMapped.state,
        title: pullRequestMapped.title,
        body: pullRequestMapped.body,
        updatedAt: new Date(pull_request.updated_at || Date.now()),
      });
    } catch (error) {
      console.error('Error updating pull request:', error);
    }
  }

  private async handlePullRequestClosure({
    pull_request,
  }: EmitterWebhookEvent<'pull_request.closed'>['payload']): Promise<void> {
    try {
      await this.pullRequestService.updatePullRequest(pull_request.id, {
        state: pull_request.state,
        closedAt: new Date(pull_request.closed_at || Date.now()),
        mergedAt: pull_request.merged
          ? new Date(pull_request.merged_at || Date.now())
          : null,
      });
    } catch (error) {
      console.error('Error closing pull request:', error);
    }
  }

  private async handlePullRequestReopening(
    payload: EmitterWebhookEvent<'pull_request.reopened'>['payload'],
  ): Promise<void> {
    try {
      await this.pullRequestService.updatePullRequest(payload.pull_request.id, {
        state: payload.pull_request.state,
        closedAt: null,
      });
    } catch (error) {
      console.error('Error reopening pull request:', error);
    }
  }

  private async handlePullRequestSynchronization(
    payload: EmitterWebhookEvent<'pull_request.synchronize'>['payload'],
  ): Promise<void> {
    try {
      const { pull_request } = payload;
      await this.pullRequestService.updatePullRequest(pull_request.id, {
        state: pull_request.state,
        updatedAt: new Date(pull_request.updated_at || Date.now()),
        additions: pull_request.additions,
        deletions: pull_request.deletions,
        changedFiles: pull_request.changed_files,
      });
    } catch (error) {
      console.error('Error synchronizing pull request:', error);
    }
  }

  private async handlePullRequestReadyForReview(
    payload: EmitterWebhookEvent<'pull_request.ready_for_review'>['payload'],
  ): Promise<void> {
    try {
      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: payload.pull_request,
        repository: payload.repository,
      });
      const reviewParams: AIReviewParams = {
        pullRequest: pullRequestMapped,
        repository: {
          name: payload.repository.name,
          owner: payload.repository.owner.login,
        },
        includeFileContents: true,
      };

      await this.aiReviewService.generatePullRequestSummary(
        this.octokit as Octokit,
        reviewParams,
      );

      await this.aiReviewService.generatePullRequestReview(
        this.octokit as Octokit,
        reviewParams,
      );
    } catch (error) {
      console.error('Error marking pull request as ready for review:', error);
    }
  }
}
