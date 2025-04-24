import { AccountSettings } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { PostgresAccountSettingsRepository } from 'src/common/database/repositories/postgres-account-settings.repository';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { MockDbClient } from 'tests/mocks/repositories/mock-db-client';

describe('PostgresAccountSettingsRepository', () => {
  let repository: PostgresAccountSettingsRepository;
  let dbClient: DbClient;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    repository = new PostgresAccountSettingsRepository(dbClient);
  });

  it('should get account settings', async () => {
    const accountId = '123';
    const expectedSettings: AccountSettings = {
      id: '1',
      accountId: '2',
      autoReviewEnabled: false,
      requestChangesWorkflowEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(dbClient.accountSettings, 'findFirst').mockResolvedValue(
      expectedSettings,
    );

    const settings = await repository.getSettings(accountId);

    expect(settings).toEqual(expectedSettings);
    expect(dbClient.accountSettings.findFirst).toHaveBeenCalledWith({
      where: { accountId },
    });
  });

  it('should set account settings', async () => {
    const accountId = '123';
    const settings: BotSettings = {
      autoReviewEnabled: true,
      requestChangesWorkflowEnabled: false,
    };

    vi.spyOn(dbClient.accountSettings, 'upsert').mockResolvedValue(
      {} as unknown as AccountSettings,
    );

    await repository.setSettings(accountId, settings);

    expect(dbClient.accountSettings.upsert).toHaveBeenCalledWith({
      where: { accountId },
      create: { accountId, ...settings },
      update: { ...settings },
    });
  });
});
