import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { mapPullRequestWithRepository } from '../mappers/pull-request.mapper';
import { EventHandler } from '../interfaces/event-handler';
import { Octokit } from '../interfaces/octokit';
import { AIReviewParams } from 'src/core/interfaces/review-params';
import { PullRequest } from '@prisma/client';
import { PullRequestEvent } from '../interfaces/events';
import { PullRequestRepository } from 'src/core/repositories/pull-request.repository';
import { AIReviewService } from 'src/core/services/ai-review.service';

export class PullRequestHandler extends EventHandler<
  PullRequestEvent['payload']
> {
  constructor(
    event: PullRequestEvent,
    private readonly pullRequestRepository: PullRequestRepository,
    private readonly aiReviewService: AIReviewService,
  ) {
    super(event);

    this.aiReviewService.setGitProvider(this.octokit as Octokit);
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

  private async reviewPullRequest({
    pullRequest,
    repository,
  }: {
    pullRequest: PullRequest;
    repository: { name: string; owner: string };
  }): Promise<void> {
    const reviewParams: AIReviewParams = {
      pullRequest,
      repository,
    };
    await this.aiReviewService.generatePullRequestSummary({
      ...reviewParams,
      fullReview: true,
      includeFileContents: true,
    });

    await this.aiReviewService.generatePullRequestReview(reviewParams);
  }

  private async handlePullRequestCreation({
    pull_request,
    repository,
  }: EmitterWebhookEvent<'pull_request.opened'>['payload']): Promise<void> {
    try {
      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: pull_request,
        repository: repository,
      });

      await this.pullRequestRepository.savePullRequest(pullRequestMapped);

      if (!pull_request.draft) {
        await this.reviewPullRequest({
          pullRequest: pullRequestMapped,
          repository: {
            name: repository.name,
            owner: repository.owner.login,
          },
        });
      }
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
      await this.pullRequestRepository.updatePullRequest(pull_request.id, {
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
      await this.pullRequestRepository.updatePullRequest(pull_request.id, {
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
      await this.pullRequestRepository.updatePullRequest(
        payload.pull_request.id,
        {
          state: payload.pull_request.state,
          closedAt: null,
        },
      );
    } catch (error) {
      console.error('Error reopening pull request:', error);
    }
  }

  private async handlePullRequestSynchronization(
    payload: EmitterWebhookEvent<'pull_request.synchronize'>['payload'],
  ): Promise<void> {
    try {
      const { pull_request, repository } = payload;

      await this.pullRequestRepository.updatePullRequest(pull_request.id, {
        state: pull_request.state,
        updatedAt: new Date(pull_request.updated_at || Date.now()),
        additions: pull_request.additions,
        deletions: pull_request.deletions,
        changedFiles: pull_request.changed_files,
        baseSha: pull_request.base.sha,
        headSha: pull_request.head.sha,
      });

      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: pull_request,
        repository: repository,
      });

      if (!pull_request.draft) {
        await this.reviewPullRequest({
          pullRequest: pullRequestMapped,
          repository: {
            name: repository.name,
            owner: repository.owner.login,
          },
        });
      }
    } catch (error) {
      console.error('Error synchronizing pull request:', error);
    }
  }

  private async handlePullRequestReadyForReview({
    pull_request,
    repository,
  }: EmitterWebhookEvent<'pull_request.ready_for_review'>['payload']): Promise<void> {
    try {
      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: pull_request,
        repository: repository,
      });

      if (!pull_request.draft) {
        await this.reviewPullRequest({
          pullRequest: pullRequestMapped,
          repository: {
            name: repository.name,
            owner: repository.owner.login,
          },
        });
      }
    } catch (error) {
      console.error('Error marking pull request as ready for review:', error);
    }
  }
}
