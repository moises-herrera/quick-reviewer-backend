import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { mapPullRequestWithRepository } from '../mappers/pull-request.mapper';
import { EventHandler } from '../interfaces/event-handler';
import { Octokit } from '../interfaces/octokit';
import { AIReviewParams } from 'src/core/interfaces/review-params';
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

  private async reviewPullRequest(config: AIReviewParams): Promise<void> {
    await this.aiReviewService.generatePullRequestSummary(config);
    await this.aiReviewService.generatePullRequestReview(config);
  }

  private async handlePullRequestCreation({
    pull_request,
    repository,
  }: EmitterWebhookEvent<'pull_request.opened'>['payload']): Promise<void> {
    try {
      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: pull_request,
        repositoryId: repository.id,
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
        repositoryId: repository.id,
      });

      await this.pullRequestRepository.updatePullRequest(pullRequestMapped.id, {
        state: pullRequestMapped.state,
        title: pullRequestMapped.title,
        body: pullRequestMapped.body,
        updatedAt: pullRequestMapped.updatedAt,
      });
    } catch (error) {
      console.error('Error updating pull request:', error);
    }
  }

  private async handlePullRequestClosure(
    payload: EmitterWebhookEvent<'pull_request.closed'>['payload'],
  ): Promise<void> {
    try {
      const { pull_request } = payload;
      await this.pullRequestRepository.updatePullRequest(
        pull_request.id.toString(),
        {
          state: pull_request.state,
          closedAt: new Date(pull_request.closed_at || Date.now()),
          mergedAt: pull_request.merged
            ? new Date(pull_request.merged_at || Date.now())
            : null,
        },
      );
    } catch (error) {
      console.error('Error closing pull request:', error);
    }
  }

  private async handlePullRequestReopening(
    payload: EmitterWebhookEvent<'pull_request.reopened'>['payload'],
  ): Promise<void> {
    try {
      await this.pullRequestRepository.updatePullRequest(
        payload.pull_request.id.toString(),
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

      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: pull_request,
        repositoryId: repository.id,
      });
      await this.pullRequestRepository.updatePullRequest(pullRequestMapped.id, {
        state: pullRequestMapped.state,
        updatedAt: pullRequestMapped.updatedAt,
        additions: pullRequestMapped.additions,
        deletions: pullRequestMapped.deletions,
        changedFiles: pullRequestMapped.changedFiles,
        baseSha: pullRequestMapped.baseSha,
        headSha: pullRequestMapped.headSha,
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

  private async handlePullRequestReadyForReview(
    payload: EmitterWebhookEvent<'pull_request.ready_for_review'>['payload'],
  ): Promise<void> {
    try {
      const { pull_request, repository } = payload;

      const pullRequestMapped = mapPullRequestWithRepository({
        pullRequest: pull_request,
        repositoryId: repository.id,
      });

      await this.reviewPullRequest({
        pullRequest: pullRequestMapped,
        repository: {
          name: repository.name,
          owner: repository.owner.login,
        },
      });
    } catch (error) {
      console.error('Error marking pull request as ready for review:', error);
    }
  }
}
