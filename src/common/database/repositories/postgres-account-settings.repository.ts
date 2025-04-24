import { AccountSettings } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { DbClient } from 'src/common/database/db-client';
import { AccountSettingsRepository } from 'src/common/database/abstracts/account-settings.repository';
import { BotSettings } from 'src/common/interfaces/bot-settings';

@injectable()
export class PostgresAccountSettingsRepository
  implements AccountSettingsRepository
{
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  getSettings(accountId: string): Promise<AccountSettings | null> {
    return this.dbClient.accountSettings.findFirst({
      where: {
        accountId,
      },
    });
  }

  async setSettings(accountId: string, settings: BotSettings): Promise<void> {
    await this.dbClient.accountSettings.upsert({
      where: {
        accountId,
      },
      create: {
        accountId,
        ...settings,
      },
      update: {
        ...settings,
      },
    });
  }
}
