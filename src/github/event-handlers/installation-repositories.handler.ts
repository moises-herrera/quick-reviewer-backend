import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { RepositoryService } from '../services/repository.service';
import { Repository } from '@prisma/client';

type EventPayload = EmitterWebhookEvent<'installation_repositories'>['payload'];

type InstallationRepositoriesEvent = GitHubWebHookEvent<EventPayload>;

export class InstallationRepositoriesHandler extends EventHandler<EventPayload> {
  private readonly repositoryService = new RepositoryService();

  constructor(event: InstallationRepositoriesEvent) {
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
            ownerId: payload.installation.account?.id as unknown as bigint,
          }) as unknown as Repository,
      ) || [];

    await this.repositoryService.saveRepositories(repositoriesMapped);
  }

  private async removeRepositories(
    payload: EmitterWebhookEvent<'installation_repositories.removed'>['payload'],
  ): Promise<void> {
    if (!payload.repositories_removed.length) return;
    const repositoriesIds = payload.repositories_removed.map(({ id }) => id);

    await this.repositoryService.deleteRepositories(repositoriesIds);
  }
}
