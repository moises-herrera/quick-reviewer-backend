import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { mapPullRequestToCreation } from '../mappers/pull-request.mapper';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { PullRequestService } from '../services/pull-request.service';

type EventPayload = EmitterWebhookEvent<'pull_request'>['payload'];

type PullRequestEvent = GitHubWebHookEvent<EventPayload>;

export class PullRequestHandler extends EventHandler<EventPayload> {
  private readonly pullRequestService = new PullRequestService();

  constructor(event: PullRequestEvent) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'opened':
        await this.handlePullRequestCreation(this.payload);
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

      default:
        break;
    }
  }

  private async handlePullRequestCreation(
    payload: EmitterWebhookEvent<'pull_request.opened'>['payload'],
  ): Promise<void> {
    try {
      await this.pullRequestService.savePullRequest(
        mapPullRequestToCreation(payload),
      );
    } catch (error) {
      console.error('Error creating pull request:', error);
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

  private async handlePullRequestSynchronization({
    pull_request,
  }: EmitterWebhookEvent<'pull_request.synchronize'>['payload']): Promise<void> {
    try {
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
}
