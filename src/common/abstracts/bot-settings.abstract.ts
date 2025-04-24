import { injectable } from 'inversify';
import { BotSettings } from 'src/common/interfaces/bot-settings';

@injectable()
export abstract class BotSettingsService {
  abstract getSettings(
    accountId: string,
    repositoryId?: string,
  ): Promise<BotSettings>;
}
