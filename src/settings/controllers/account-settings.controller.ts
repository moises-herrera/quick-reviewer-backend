import { StatusCodes } from 'http-status-codes';
import { inject } from 'inversify';
import { AccountSettingsRepository } from 'src/common/database/abstracts/account-settings.repository';
import { HttpException } from 'src/common/exceptions/http-exception';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export class AccountSettingsController {
  constructor(
    @inject(AccountSettingsRepository)
    private readonly accountSettingsRepository: AccountSettingsRepository,
  ) {}

  getAccountSettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { accountId } = req.params;
      const settings =
        await this.accountSettingsRepository.getSettings(accountId);

      if (!settings) {
        throw new HttpException('Account not found', StatusCodes.NOT_FOUND);
      }

      res.status(StatusCodes.OK).json(settings);
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
}
