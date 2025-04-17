import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from 'src/github/interfaces/event-handler';
import { Repository } from '@prisma/client';
import { InstallationRepositoriesEvent } from 'src/github/interfaces/events';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { LoggerService } from 'src/common/abstracts/logger.abstract';

export class InstallationRepositoriesHandler extends EventHandler<
  InstallationRepositoriesEvent['payload']
> {
  constructor(
    event: InstallationRepositoriesEvent,
    private readonly projectRepository: ProjectRepository,
    private readonly loggerService: LoggerService,
  ) {
    super(event);
  }

  async handle() {
    switch (this.payload.action) {
      case 'added':
        await this.addRepositories(this.payload);
        break;

      case 'removed':
        await this.removeRepositories(this.payload);
        break;
    }
  }

  private async addRepositories(
    payload: EmitterWebhookEvent<'installation_repositories.added'>['payload'],
  ): Promise<void> {
    if (!payload.repositories_added.length) return;
    const repositoriesMapped = payload.repositories_added.map(
      (data) =>
        ({
          id: data.id,
          name: data.full_name,
          ownerId: payload.installation.account?.id.toString(),
        }) as unknown as Repository,
    );

    try {
      await this.projectRepository.saveRepositories(repositoriesMapped);
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error saving repositories',
      });
    }
  }

  private async removeRepositories(
    payload: EmitterWebhookEvent<'installation_repositories.removed'>['payload'],
  ): Promise<void> {
    if (!payload.repositories_removed.length) return;
    const repositoriesIds = payload.repositories_removed.map(({ id }) =>
      id.toString(),
    );

    try {
      await this.projectRepository.deleteRepositories(repositoriesIds);
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error deleting repositories',
      });
    }
  }
}
