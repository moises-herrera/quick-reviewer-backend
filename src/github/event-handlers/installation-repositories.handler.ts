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

    try {
      const existingRepositories =
        await this.projectRepository.getRepositoriesByIds(
          payload.repositories_added.map(({ id }) => id.toString()),
        );
      const repositoriesToSave = payload.repositories_added.filter(
        ({ id }) =>
          !existingRepositories.some(
            (repository) => repository.id === id.toString(),
          ),
      );

      const repositoriesMapped = repositoriesToSave.map(
        (data) =>
          ({
            id: data.id.toString(),
            name: data.name,
            ownerId: payload.installation.account?.id.toString(),
          }) as Repository,
      );

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

    try {
      const repositoriesIds = payload.repositories_removed.map(({ id }) =>
        id.toString(),
      );
      const existingRepositories =
        await this.projectRepository.getRepositoriesByIds(repositoriesIds);
      const repositoriesToDelete = existingRepositories.map(({ id }) => id);

      await this.projectRepository.deleteRepositories(repositoriesToDelete);
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error deleting repositories',
      });
    }
  }
}
