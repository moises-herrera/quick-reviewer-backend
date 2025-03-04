import { EmitterWebhookEvent } from '@octokit/webhooks';
import { prisma } from 'src/database/db-connection';
import { EventHandler } from '../interfaces/event-handler';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';

type EventPayload = EmitterWebhookEvent<'repository'>['payload'];

type RepositoryEvent = GitHubWebHookEvent<EventPayload>;

export class RepositoryHandler extends EventHandler<EventPayload> {
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
      await prisma.repository.create({
        data: {
          id: payload.repository.node_id,
          name: payload.repository.name,
          ownerId: payload.repository.owner.node_id,
        },
      });
    } catch (error) {
      console.error('Error creating repository:', error);
    }
  }

  private async handleRepositoryDeletion(
    payload: EmitterWebhookEvent<'repository.deleted'>['payload'],
  ): Promise<void> {
    try {
      await prisma.repository.delete({
        where: {
          id: payload.repository.node_id,
        },
      });
    } catch (error) {
      console.error('Error deleting repository:', error);
    }
  }

  private async handleRepositoryRenamed(
    payload: EmitterWebhookEvent<'repository.renamed'>['payload'],
  ): Promise<void> {
    try {
      await prisma.repository.update({
        where: {
          id: payload.repository.node_id,
        },
        data: {
          name: payload.repository.name,
        },
      });
    } catch (error) {
      console.error('Error editing repository:', error);
    }
  }
}
