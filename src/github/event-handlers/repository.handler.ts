import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from 'src/github/interfaces/event-handler';
import { Repository } from '@prisma/client';
import { RepositoryEvent } from 'src/github/interfaces/events';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { LoggerService } from 'src/common/abstracts/logger.abstract';

export class RepositoryHandler extends EventHandler<
  RepositoryEvent['payload']
> {
  constructor(
    event: RepositoryEvent,
    private readonly projectRepository: ProjectRepository,
    private readonly loggerService: LoggerService,
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
        id: payload.repository.id.toString(),
        name: payload.repository.name,
        ownerId: payload.repository.owner.id.toString(),
      } as unknown as Repository);
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error creating repository',
      });
    }
  }

  private async handleRepositoryDeletion(
    payload: EmitterWebhookEvent<'repository.deleted'>['payload'],
  ): Promise<void> {
    try {
      await this.projectRepository.deleteRepository(
        payload.repository.id.toString(),
      );
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error deleting repository',
      });
    }
  }

  private async handleRepositoryRenamed(
    payload: EmitterWebhookEvent<'repository.renamed'>['payload'],
  ): Promise<void> {
    try {
      await this.projectRepository.renameRepository(
        payload.repository.id.toString(),
        payload.repository.name,
      );
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error editing repository',
      });
    }
  }
}
