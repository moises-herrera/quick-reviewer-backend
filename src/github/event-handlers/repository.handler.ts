import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { Repository } from '@prisma/client';
import { RepositoryEvent } from '../interfaces/events';
import { ProjectRepository } from 'src/core/repositories/project.repository';

export class RepositoryHandler extends EventHandler<
  RepositoryEvent['payload']
> {
  constructor(
    event: RepositoryEvent,
    private readonly projectRepository: ProjectRepository,
  ) {
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
      await this.projectRepository.saveRepository({
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
      await this.projectRepository.deleteRepository(payload.repository.id);
    } catch (error) {
      console.error('Error deleting repository:', error);
    }
  }

  private async handleRepositoryRenamed(
    payload: EmitterWebhookEvent<'repository.renamed'>['payload'],
  ): Promise<void> {
    try {
      await this.projectRepository.renameRepository(
        payload.repository.id,
        payload.repository.name,
      );
    } catch (error) {
      console.error('Error editing repository:', error);
    }
  }
}
