import { AccountSettings, RepositorySettings } from '@prisma/client';
import { AccountSettingsRepository } from 'src/common/database/abstracts/account-settings.repository';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { AppBotSettingsService } from 'src/common/services/app-bot-settings.service';
import { MockAccountSettingsRepository } from 'tests/mocks/repositories/mock-account-settings.repository';
import { MockProjectSettingsRepository } from 'tests/mocks/repositories/mock-project-settings.repository';

describe('AppBotSettingsService', () => {
  let service: AppBotSettingsService;
  let accountSettingsRepository: AccountSettingsRepository;
  let projectSettingsRepository: ProjectSettingsRepository;

  beforeEach(() => {
    accountSettingsRepository = new MockAccountSettingsRepository();
    projectSettingsRepository = new MockProjectSettingsRepository();
    service = new AppBotSettingsService(
      accountSettingsRepository,
      projectSettingsRepository,
    );
  });

  describe('getSettings', () => {
    it('should return account settings when repositoryId is not provided', async () => {
      const accountId = '1';
      const accountSettings: AccountSettings = {
        id: '1',
        accountId,
        autoReviewEnabled: true,
        requestChangesWorkflowEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedSettings: BotSettings = {
        autoReviewEnabled: accountSettings.autoReviewEnabled,
        requestChangesWorkflowEnabled:
          accountSettings.requestChangesWorkflowEnabled,
      };

      vi.spyOn(accountSettingsRepository, 'getSettings').mockResolvedValueOnce(
        accountSettings,
      );

      const settings = await service.getSettings(accountId);
      expect(settings).toEqual(expectedSettings);
      expect(accountSettingsRepository.getSettings).toHaveBeenCalledWith(
        accountId,
      );
      expect(projectSettingsRepository.getSettings).not.toHaveBeenCalled();
    });

    it('should return project settings when repositoryId is provided', async () => {
      const accountId = '1';
      const repositoryId = '2';
      const accountSettings: AccountSettings = {
        id: '1',
        accountId,
        autoReviewEnabled: false,
        requestChangesWorkflowEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const projectSettings: RepositorySettings = {
        id: '2',
        repositoryId,
        autoReviewEnabled: true,
        requestChangesWorkflowEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedSettings: BotSettings = {
        autoReviewEnabled: projectSettings.autoReviewEnabled,
        requestChangesWorkflowEnabled:
          projectSettings.requestChangesWorkflowEnabled,
      };

      vi.spyOn(accountSettingsRepository, 'getSettings').mockResolvedValueOnce(
        accountSettings,
      );
      vi.spyOn(projectSettingsRepository, 'getSettings').mockResolvedValueOnce(
        projectSettings,
      );

      const settings = await service.getSettings(accountId, repositoryId);
      expect(settings).toEqual(expectedSettings);
      expect(accountSettingsRepository.getSettings).toHaveBeenCalledWith(
        accountId,
      );
      expect(projectSettingsRepository.getSettings).toHaveBeenCalledWith(
        repositoryId,
      );
    });

    it('should return default settings when no settings are found and the repositoryId is not provided', async () => {
      const accountId = '1';
      const expectedSettings: BotSettings = {
        autoReviewEnabled: false,
        requestChangesWorkflowEnabled: false,
      };

      vi.spyOn(accountSettingsRepository, 'getSettings').mockResolvedValueOnce(
        null,
      );

      const settings = await service.getSettings(accountId);
      expect(settings).toEqual(expectedSettings);
    });

    it('should return account settings when project settings are not found', async () => {
      const accountId = '1';
      const repositoryId = '2';
      const accountSettings: AccountSettings = {
        id: '1',
        accountId,
        autoReviewEnabled: true,
        requestChangesWorkflowEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const expectedSettings: BotSettings = {
        autoReviewEnabled: accountSettings.autoReviewEnabled,
        requestChangesWorkflowEnabled:
          accountSettings.requestChangesWorkflowEnabled,
      };

      vi.spyOn(accountSettingsRepository, 'getSettings').mockResolvedValueOnce(
        accountSettings,
      );
      vi.spyOn(projectSettingsRepository, 'getSettings').mockResolvedValueOnce(
        null,
      );

      const settings = await service.getSettings(accountId, repositoryId);
      expect(settings).toEqual(expectedSettings);
    });

    it('should return default settings when no settings are found', async () => {
      const accountId = '1';
      const repositoryId = '2';
      const expectedSettings: BotSettings = {
        autoReviewEnabled: false,
        requestChangesWorkflowEnabled: false,
      };

      vi.spyOn(accountSettingsRepository, 'getSettings').mockResolvedValueOnce(
        null,
      );
      vi.spyOn(projectSettingsRepository, 'getSettings').mockResolvedValueOnce(
        null,
      );

      const settings = await service.getSettings(accountId, repositoryId);
      expect(settings).toEqual(expectedSettings);
    });
  });
});
