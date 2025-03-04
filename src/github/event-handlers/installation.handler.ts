import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { prisma } from 'src/database/db-connection';
import { mapRepositoriesToCreation } from '../mappers/repository.mapper';
import { mapAccountToCreation } from '../mappers/account.mapper';
import { PullRequestService } from '../services/pull-request.service';
import { EventHandler } from '../interfaces/event-handler';
import { AccountData } from '../interfaces/account-data';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';

type InstallationEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'installation'>['payload']
>;

export class InstallationHandler extends EventHandler<
  EmitterWebhookEvent<'installation'>['payload']
> {
  private readonly pullRequestService = new PullRequestService(this.octokit);

  constructor(event: InstallationEvent) {
    super(event);
  }

  async handle() {
    switch (this.payload.action) {
      case 'created':
        await this.handleAppCreation(this.payload);
        break;

      case 'deleted':
        await this.handleAppDeletion(this.payload);
        break;

      default:
        break;
    }
  }

  private async handleAppCreation(
    payload: EmitterWebhookEvent<'installation.created'>['payload'],
  ) {
    if (!payload.installation.account) return;

    try {
      const repositoriesMapped = mapRepositoriesToCreation(
        payload.repositories || [],
      );

      const account = await prisma.account.create({
        data: {
          ...mapAccountToCreation(payload.installation.account as AccountData),
          repositories: {
            createMany: {
              data: repositoriesMapped,
            },
          },
        },
      });

      const pullRequestsPromises = repositoriesMapped.map(({ name }) => {
        return this.pullRequestService.savePullRequestsHistoryByRepository({
          owner: account.name,
          name,
        });
      });

      await Promise.all(pullRequestsPromises);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }

  private async handleAppDeletion(
    payload: EmitterWebhookEvent<'installation.deleted'>['payload'],
  ) {
    if (!payload.installation.account) return;

    try {
      await prisma.account.delete({
        where: {
          id: payload.installation.account?.id,
        },
      });
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  }
}
