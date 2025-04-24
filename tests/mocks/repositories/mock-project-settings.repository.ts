import { RepositorySettings } from '@prisma/client';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';

export class MockProjectSettingsRepository
  implements ProjectSettingsRepository
{
  getSettings = vi.fn((): Promise<RepositorySettings | null> => {
    return Promise.resolve(null);
  });

  setSettings = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });

  deleteSettings = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });

  syncSettingsWithAccount = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });
}
