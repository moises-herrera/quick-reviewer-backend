import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AccountSettingsController } from 'src/accounts/controllers/account-settings.controller';
import { AccountSettingsRepository } from 'src/common/database/abstracts/account-settings.repository';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { MockAccountSettingsRepository } from 'tests/mocks/repositories/mock-account-settings.repository';
import { MockProjectSettingsRepository } from 'tests/mocks/repositories/mock-project-settings.repository';

describe('AccountSettingsController', () => {
  let controller: AccountSettingsController;
  let accountSettingsRepository: AccountSettingsRepository;
  let projectSettingsRepository: ProjectSettingsRepository;

  const accountId = '123';
  const req = { params: { accountId } } as unknown as AuthRequest;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const next = vi.fn();

  beforeEach(() => {
    accountSettingsRepository = new MockAccountSettingsRepository();
    projectSettingsRepository = new MockProjectSettingsRepository();
    controller = new AccountSettingsController(
      accountSettingsRepository,
      projectSettingsRepository,
    );
  });

  describe('getAccountSettings', () => {
    it('should return account settings', async () => {
      vi.spyOn(accountSettingsRepository, 'getSettings').mockResolvedValue({
        id: '123',
        accountId: '123',
        autoReviewEnabled: false,
        requestChangesWorkflowEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await controller.getAccountSettings(req, res, next);

      expect(accountSettingsRepository.getSettings).toHaveBeenCalledWith(
        accountId,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        autoReviewEnabled: false,
        requestChangesWorkflowEnabled: false,
      });
    });

    it('should return default settings if none are found', async () => {
      vi.spyOn(accountSettingsRepository, 'getSettings').mockResolvedValue(
        null,
      );

      await controller.getAccountSettings(req, res, next);

      expect(accountSettingsRepository.getSettings).toHaveBeenCalledWith(
        accountId,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        autoReviewEnabled: false,
        requestChangesWorkflowEnabled: false,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      vi.spyOn(accountSettingsRepository, 'getSettings').mockRejectedValue(
        error,
      );

      await controller.getAccountSettings(req, res, next);

      expect(accountSettingsRepository.getSettings).toHaveBeenCalledWith(
        accountId,
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateAccountSettings', () => {
    it('should update account settings', async () => {
      const settings: BotSettings = {
        autoReviewEnabled: true,
        requestChangesWorkflowEnabled: true,
      };

      vi.spyOn(accountSettingsRepository, 'setSettings').mockResolvedValue();

      await controller.updateAccountSettings(
        { ...req, body: settings } as AuthRequest,
        res,
        next,
      );

      expect(accountSettingsRepository.setSettings).toHaveBeenCalledWith(
        accountId,
        settings,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'Settings updated' });
    });

    it('should handle errors', async () => {
      const settings: BotSettings = {
        autoReviewEnabled: true,
        requestChangesWorkflowEnabled: true,
      };
      const error = new Error('Database error');
      vi.spyOn(accountSettingsRepository, 'setSettings').mockRejectedValue(
        error,
      );

      await controller.updateAccountSettings(
        { ...req, body: settings } as AuthRequest,
        res,
        next,
      );

      expect(accountSettingsRepository.setSettings).toHaveBeenCalledWith(
        accountId,
        settings,
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('syncRepositorySettings', () => {
    it('should synchronize repository settings', async () => {
      vi.spyOn(
        projectSettingsRepository,
        'syncSettingsWithAccount',
      ).mockResolvedValue();

      await controller.syncRepositorySettings(req, res, next);

      expect(
        projectSettingsRepository.syncSettingsWithAccount,
      ).toHaveBeenCalledWith(accountId);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Repository settings synchronized',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      vi.spyOn(
        projectSettingsRepository,
        'syncSettingsWithAccount',
      ).mockRejectedValue(error);

      await controller.syncRepositorySettings(req, res, next);

      expect(
        projectSettingsRepository.syncSettingsWithAccount,
      ).toHaveBeenCalledWith(accountId);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
