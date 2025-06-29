import { RepositorySettings } from '@prisma/client';
import { injectable } from 'inversify';
import { BotSettings } from 'src/common/interfaces/bot-settings';

@injectable()
export abstract class ProjectSettingsRepository {
  abstract getSettings(projectId: string): Promise<RepositorySettings | null>;
  abstract setSettings(projectId: string, settings: BotSettings): Promise<void>;
  abstract deleteSettings(projectId: string): Promise<void>;
  abstract syncSettingsWithAccount(accountId: string): Promise<void>;
}
