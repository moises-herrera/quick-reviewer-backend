import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { mapRepositoriesToCreation } from '../mappers/repository.mapper';
import { mapAccountToCreation } from '../mappers/account.mapper';
import { EventHandler } from '../interfaces/event-handler';
import { AccountData } from '../interfaces/account-data';
import { prisma } from 'src/database/db-connection';
import { GitHubHistoryService } from '../services/github-history.service';
import { InstallationEvent } from '../interfaces/events';
import { AccountRepository } from 'src/core/repositories/account.repository';

export class InstallationHandler extends EventHandler<
  InstallationEvent['payload']
> {
  constructor(
    event: InstallationEvent,
    private readonly accountService: AccountRepository,
    private readonly historyService: GitHubHistoryService,
  ) {
    super(event);

    if (event.octokit) {
      this.historyService.setOctokit(event.octokit);
    }
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

      const account = await this.accountService.saveAccount({
        ...mapAccountToCreation(payload.installation.account as AccountData),
        repositories: repositoriesMapped,
      });

      const isTestAccount = await prisma.testAccount.findFirst({
        where: { name: account.name },
      });

      if (isTestAccount) {
        await this.historyService.recordHistory(
          account.name,
          repositoriesMapped,
        );
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }

  private async handleAppDeletion(
    payload: EmitterWebhookEvent<'installation.deleted'>['payload'],
  ) {
    if (!payload.installation.account) return;

    try {
      await this.accountService.deleteAccount(payload.installation.account.id);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  }
}
