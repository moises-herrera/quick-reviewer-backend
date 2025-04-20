import { inject } from 'inversify';
import { BotSettingsService } from 'src/common/abstracts/bot-settings.abstract';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { AccountSettingsRepository } from 'src/common/database/abstracts/account-settings.repository';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';

export class AppBotSettingsService implements BotSettingsService {
  constructor(
    @inject(AccountSettingsRepository)
    private readonly accountSettingsRepository: AccountSettingsRepository,
    @inject(ProjectSettingsRepository)
    private readonly projectSettingsRepository: ProjectSettingsRepository,
  ) {}

  async getSettings(
    accountId: string,
    repositoryId?: string,
  ): Promise<BotSettings> {
    const accountSettings =
      await this.accountSettingsRepository.getSettings(accountId);

    if (!repositoryId) {
      return {
        autoReviewEnabled: accountSettings?.autoReviewEnabled ?? false,
        requestChangesWorkflowEnabled:
          accountSettings?.requestChangesWorkflowEnabled ?? false,
      };
    }

    const projectSettings =
      await this.projectSettingsRepository.getSettings(repositoryId);

    return {
      autoReviewEnabled:
        projectSettings?.autoReviewEnabled ??
        accountSettings?.autoReviewEnabled ??
        false,
      requestChangesWorkflowEnabled:
        projectSettings?.requestChangesWorkflowEnabled ??
        accountSettings?.requestChangesWorkflowEnabled ??
        false,
    };
  }
}
