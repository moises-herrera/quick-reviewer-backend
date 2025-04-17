import { EmitterWebhookEvent } from '@octokit/webhooks/dist-types/types';
import { RepositoryMapper } from 'src/github/mappers/repository.mapper';
import { AccountMapper } from 'src/github/mappers/account.mapper';
import { EventHandler } from 'src/github/interfaces/event-handler';
import { AccountData } from 'src/github/interfaces/account-data';
import { InstallationEvent } from 'src/github/interfaces/events';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { HistoryService } from 'src/github/abstracts/history.abstract';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';
import { LoggerService } from 'src/common/abstracts/logger.abstract';

export class InstallationHandler extends EventHandler<
  InstallationEvent['payload']
> {
  constructor(
    event: InstallationEvent,
    private readonly accountRepository: AccountRepository,
    private readonly testAccountRepository: TestAccountRepository,
    private readonly historyService: HistoryService,
    private readonly loggerService: LoggerService,
  ) {
    super(event);

    if (event.octokit) {
      this.historyService.setGitProvider(event.octokit);
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
    }
  }

  private async handleAppCreation(
    payload: EmitterWebhookEvent<'installation.created'>['payload'],
  ) {
    if (!payload.installation.account) return;

    try {
      const repositoriesMapped = RepositoryMapper.mapManyToCreation(
        payload.repositories || [],
      );

      const account = await this.accountRepository.saveAccount({
        ...AccountMapper.mapToCreation(
          payload.installation.account as AccountData,
        ),
        repositories: repositoriesMapped,
      });

      const isTestAccount =
        await this.testAccountRepository.findTestAccountByName(account.name);

      if (isTestAccount) {
        await this.historyService.recordHistory(
          account.name,
          repositoriesMapped,
        );
      }
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error creating account',
      });
    }
  }

  private async handleAppDeletion(
    payload: EmitterWebhookEvent<'installation.deleted'>['payload'],
  ) {
    if (!payload.installation.account) return;

    try {
      await this.accountRepository.deleteAccount(
        payload.installation.account.id.toString(),
      );
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error deleting account',
      });
    }
  }
}
