import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { mapRepositoriesToCreation } from '../mappers/repository.mapper';
import { mapAccountToCreation } from '../mappers/account.mapper';
import { EventHandler } from '../interfaces/event-handler';
import { AccountData } from '../interfaces/account-data';
import { GitHubWebHookEvent } from '../interfaces/github-webhook-event';
import { AccountRepository } from '../repositories/account.repository';
import { prisma } from 'src/database/db-connection';
import { HistoryService } from '../../history/services/history.service';
import { Octokit } from 'octokit';

type InstallationEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'installation'>['payload']
>;

export class InstallationHandler extends EventHandler<
  EmitterWebhookEvent<'installation'>['payload']
> {
  private readonly accountService = new AccountRepository();
  private readonly historyService = new HistoryService(this.octokit as Octokit);

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
