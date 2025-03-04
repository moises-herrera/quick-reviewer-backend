import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { prisma } from 'src/database/db-connection';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';

type EventPayload = EmitterWebhookEvent<'installation_repositories'>['payload'];

type InstallationRepositoriesEvent = GitHubWebHookEvent<EventPayload>;

export class InstallationRepositoriesHandler extends EventHandler<EventPayload> {
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
    if (payload.repositories_added.length) {
      const repositoriesMapped =
        payload.repositories_added?.map((data) => ({
          id: data.id,
          name: data.full_name,
          ownerId: payload.installation.account?.id as unknown as bigint,
        })) || [];

      await prisma.repository.createMany({
        data: repositoriesMapped,
      });
    }
  }

  private async removeRepositories(
    payload: EmitterWebhookEvent<'installation_repositories.removed'>['payload'],
  ): Promise<void> {
    if (payload.repositories_removed.length) {
      const repositoriesIds = payload.repositories_removed.map(({ id }) => id);

      try {
        await prisma.pullRequest.deleteMany({
          where: {
            repositoryId: {
              in: repositoriesIds,
            },
          },
        });
      } catch (error) {
        console.error('Error deleting pull requests:', error);
      }

      await prisma.repository.deleteMany({
        where: {
          id: {
            in: repositoriesIds,
          },
        },
      });
    }
  }
}
