import { RepositorySettings } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';
import { DbClient } from 'src/common/database/db-client';
import { BotSettings } from 'src/common/interfaces/bot-settings';

@injectable()
export class PostgresProjectSettingsRepository
  implements ProjectSettingsRepository
{
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async getSettings(projectId: string): Promise<RepositorySettings | null> {
    const settings = await this.dbClient.repositorySettings.findUnique({
      where: {
        repositoryId: projectId,
      },
    });

    return settings;
  }

  async setSettings(projectId: string, settings: BotSettings): Promise<void> {
    await this.dbClient.repositorySettings.upsert({
      where: {
        repositoryId: projectId,
      },
      create: {
        repositoryId: projectId,
        ...settings,
      },
      update: {
        ...settings,
      },
    });
  }

  async deleteSettings(projectId: string): Promise<void> {
    await this.dbClient.repositorySettings.deleteMany({
      where: {
        repositoryId: projectId,
      },
    });
  }

  async syncSettingsWithAccount(accountId: string): Promise<void> {
    await this.dbClient.repositorySettings.deleteMany({
      where: {
        repository: {
          ownerId: accountId,
        },
      },
    });
  }
}
