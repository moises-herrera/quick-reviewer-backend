import { RepositorySettings } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { PostgresProjectSettingsRepository } from 'src/common/database/repositories/postgres-project-settings.repository';
import { MockDbClient } from 'tests/mocks/repositories/mock-db-client';

describe('PostgresProjectSettingsRepository', () => {
  let repository: PostgresProjectSettingsRepository;
  let dbClient: DbClient;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    repository = new PostgresProjectSettingsRepository(dbClient);
  });

  it('should get settings', async () => {
    const projectId = 'test-project-id';
    const expectedSettings: RepositorySettings = {
      id: '1',
      autoReviewEnabled: false,
      requestChangesWorkflowEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      repositoryId: projectId,
    };

    vi.spyOn(dbClient.repositorySettings, 'findUnique').mockResolvedValue(
      expectedSettings,
    );

    const settings = await repository.getSettings(projectId);

    expect(settings).toEqual(expectedSettings);
    expect(dbClient.repositorySettings.findUnique).toHaveBeenCalledWith({
      where: {
        repositoryId: projectId,
      },
    });
  });

  it('should set settings', async () => {
    const projectId = 'test-project-id';
    const settings: RepositorySettings = {
      id: '1',
      autoReviewEnabled: true,
      requestChangesWorkflowEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      repositoryId: projectId,
    };

    vi.spyOn(dbClient.repositorySettings, 'upsert').mockResolvedValue(settings);

    await repository.setSettings(projectId, settings);

    expect(dbClient.repositorySettings.upsert).toHaveBeenCalledWith({
      where: {
        repositoryId: projectId,
      },
      create: {
        ...settings,
      },
      update: {
        ...settings,
      },
    });
  });

  it('should delete settings', async () => {
    const projectId = 'test-project-id';

    vi.spyOn(dbClient.repositorySettings, 'delete').mockResolvedValue(
      {} as unknown as RepositorySettings,
    );

    await repository.deleteSettings(projectId);

    expect(dbClient.repositorySettings.delete).toHaveBeenCalledWith({
      where: {
        repositoryId: projectId,
      },
    });
  });

  it('should sync settings with account', async () => {
    const accountId = 'test-account-id';

    vi.spyOn(dbClient.repositorySettings, 'deleteMany').mockResolvedValue({
      count: 1,
    });

    await repository.syncSettingsWithAccount(accountId);

    expect(dbClient.repositorySettings.deleteMany).toHaveBeenCalledWith({
      where: {
        repository: {
          ownerId: accountId,
        },
      },
    });
  });
});
