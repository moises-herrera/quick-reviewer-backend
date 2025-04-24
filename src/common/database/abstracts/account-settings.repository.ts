import { AccountSettings } from '@prisma/client';
import { injectable } from 'inversify';
import { BotSettings } from 'src/common/interfaces/bot-settings';

@injectable()
export abstract class AccountSettingsRepository {
  abstract getSettings(accountId: string): Promise<AccountSettings | null>;
  abstract setSettings(accountId: string, settings: BotSettings): Promise<void>;
}
