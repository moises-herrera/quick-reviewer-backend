import { AccountSettings } from '@prisma/client';
import { AccountSettingsRepository } from 'src/common/database/abstracts/account-settings.repository';

export class MockAccountSettingsRepository
  implements AccountSettingsRepository
{
  getSettings = vi.fn((): Promise<AccountSettings | null> => {
    return Promise.resolve(null);
  });

  setSettings = vi.fn((): Promise<void> => {
    return Promise.resolve();
  });
}
