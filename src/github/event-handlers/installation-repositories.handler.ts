import { EmitterWebhookEvent } from '@octokit/webhooks';
import { EventHandler } from '../interfaces/event-handler';
import { Repository } from '@prisma/client';
import { injectable } from 'inversify';
import { InstallationRepositoriesEvent } from '../interfaces/events';
import { ProjectRepository } from 'src/core/repositories/project.repository';

@injectable()
export class InstallationRepositoriesHandler extends EventHandler<
  InstallationRepositoriesEvent['payload']
> {
  private readonly repositoryService: ProjectRepository;

  constructor(
    event: InstallationRepositoriesEvent,
    repositoryService: ProjectRepository,
  ) {
    super(event);
    this.repositoryService = repositoryService;
  }

  async handle() {
    switch (this.payload.action) {
      case 'added':
        await this.addRepositories(this.payload);
        break;

      case 'removed':
        await this.removeRepositories(this.payload);
        break;

      default:
        break;
    }
  }

  private async addRepositories(
    payload: EmitterWebhookEvent<'installation_repositories.added'>['payload'],
  ): Promise<void> {
    if (!payload.repositories_added.length) return;
    const repositoriesMapped =
      payload.repositories_added?.map(
        (data) =>
          ({
            id: data.id,
            name: data.full_name,
            ownerId: payload.installation.account?.id.toString(),
          }) as unknown as Repository,
      ) || [];

    await this.repositoryService.saveRepositories(repositoriesMapped);
  }

  private async removeRepositories(
    payload: EmitterWebhookEvent<'installation_repositories.removed'>['payload'],
  ): Promise<void> {
    if (!payload.repositories_removed.length) return;
    const repositoriesIds = payload.repositories_removed.map(({ id }) =>
      id.toString(),
    );

    await this.repositoryService.deleteRepositories(repositoriesIds);
  }
}
