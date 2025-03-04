import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { RepositoryService } from '../services/repository.service';
import { Repository } from '@prisma/client';

type EventPayload = EmitterWebhookEvent<'repository'>['payload'];

type RepositoryEvent = GitHubWebHookEvent<EventPayload>;

export class RepositoryHandler extends EventHandler<EventPayload> {
  private readonly repositoryService = new RepositoryService();

  constructor(event: RepositoryEvent) {
    super(event);
  }

  async handle(): Promise<void> {
    switch (this.payload.action) {
      case 'created':
        await this.handleRepositoryCreation(this.payload);
        break;

      case 'deleted':
        await this.handleRepositoryDeletion(this.payload);
        break;

      case 'renamed':
        await this.handleRepositoryRenamed(this.payload);
        break;

      default:
        break;
    }
  }

  private async handleRepositoryCreation(
    payload: EmitterWebhookEvent<'repository.created'>['payload'],
  ): Promise<void> {
    try {
      await this.repositoryService.saveRepository({
        id: payload.repository.id as unknown as bigint,
        name: payload.repository.name,
        ownerId: payload.repository.owner.id as unknown as bigint,
      } as unknown as Repository);
    } catch (error) {
      console.error('Error creating repository:', error);
    }
  }

  private async handleRepositoryDeletion(
    payload: EmitterWebhookEvent<'repository.deleted'>['payload'],
  ): Promise<void> {
    try {
      await this.repositoryService.deleteRepository(payload.repository.id);
    } catch (error) {
      console.error('Error deleting repository:', error);
    }
  }

  private async handleRepositoryRenamed(
    payload: EmitterWebhookEvent<'repository.renamed'>['payload'],
  ): Promise<void> {
    try {
      await this.repositoryService.renameRepository(
        payload.repository.id,
        payload.repository.name,
      );
    } catch (error) {
      console.error('Error editing repository:', error);
    }
  }
}
