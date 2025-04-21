import { StatusCodes } from 'http-status-codes';
import { inject } from 'inversify';
import { AccountSettingsRepository } from 'src/common/database/abstracts/account-settings.repository';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export class AccountSettingsController {
  constructor(
    @inject(AccountSettingsRepository)
    private readonly accountSettingsRepository: AccountSettingsRepository,
    @inject(ProjectSettingsRepository)
    private readonly projectSettingsRepository: ProjectSettingsRepository,
  ) {}

  getAccountSettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { accountId } = req.params;
      const settings =
        await this.accountSettingsRepository.getSettings(accountId);
      const response: BotSettings = {
        autoReviewEnabled: settings?.autoReviewEnabled ?? false,
        requestChangesWorkflowEnabled:
          settings?.requestChangesWorkflowEnabled ?? false,
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateAccountSettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { accountId } = req.params;
      const settings = req.body as BotSettings;
      await this.accountSettingsRepository.setSettings(accountId, settings);
      res.status(StatusCodes.OK).json({ message: 'Settings updated' });
    } catch (error) {
      next(error);
    }
  };

  syncRepositorySettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { accountId } = req.params;
      await this.projectSettingsRepository.syncSettingsWithAccount(accountId);
      res
        .status(StatusCodes.OK)
        .json({ message: 'Repository settings synchronized' });
    } catch (error) {
      next(error);
    }
  };
}
