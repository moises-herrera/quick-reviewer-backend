import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { RepositorySettingsController } from 'src/repositories/controllers/repository-settings.controller';
import { MockProjectSettingsRepository } from 'tests/mocks/repositories/mock-project-settings.repository';

describe('RepositorySettingsController', () => {
  let controller: RepositorySettingsController;
  let projectSettingsRepository: ProjectSettingsRepository;

  const req = {
    params: {
      repositoryId: '123',
    },
  } as unknown as AuthRequest;
  let res: Response;
  let next: NextFunction;
  const settings: BotSettings = {
    autoReviewEnabled: true,
    requestChangesWorkflowEnabled: false,
  };

  beforeEach(() => {
    projectSettingsRepository = new MockProjectSettingsRepository();
    controller = new RepositorySettingsController(projectSettingsRepository);
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    next = vi.fn();
  });

  describe('getRepositorySettings', () => {
    it('should return repository settings', async () => {
      vi.spyOn(projectSettingsRepository, 'getSettings').mockResolvedValue({
        id: '123',
        repositoryId: '123',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...settings,
      });

      await controller.getRepositorySettings(req, res, next);
      expect(projectSettingsRepository.getSettings).toHaveBeenCalledWith(
        req.params.repositoryId,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(settings);
    });

    it('should return 404 if settings not found', async () => {
      vi.spyOn(projectSettingsRepository, 'getSettings').mockResolvedValue(
        null,
      );

      await controller.getRepositorySettings(req, res, next);
      expect(projectSettingsRepository.getSettings).toHaveBeenCalledWith(
        req.params.repositoryId,
      );
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: StatusCodes.NOT_FOUND,
          message: 'Repository settings not found',
        }),
      );
    });

    it('should call next with error if getSettings throws', async () => {
      const error = new Error('Database error');
      vi.spyOn(projectSettingsRepository, 'getSettings').mockRejectedValue(
        error,
      );

      await controller.getRepositorySettings(req, res, next);
      expect(projectSettingsRepository.getSettings).toHaveBeenCalledWith(
        req.params.repositoryId,
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateRepositorySettings', () => {
    it('should update repository settings', async () => {
      vi.spyOn(projectSettingsRepository, 'setSettings').mockResolvedValue();

      await controller.updateRepositorySettings(
        { ...req, body: settings } as unknown as AuthRequest,
        res,
        next,
      );
      expect(projectSettingsRepository.setSettings).toHaveBeenCalledWith(
        req.params.repositoryId,
        settings,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'Settings updated' });
    });

    it('should call next with error if setSettings throws', async () => {
      const error = new Error('Database error');
      vi.spyOn(projectSettingsRepository, 'setSettings').mockRejectedValue(
        error,
      );

      await controller.updateRepositorySettings(
        { ...req, body: settings } as unknown as AuthRequest,
        res,
        next,
      );
      expect(projectSettingsRepository.setSettings).toHaveBeenCalledWith(
        req.params.repositoryId,
        settings,
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteRepositorySettings', () => {
    it('should delete repository settings', async () => {
      vi.spyOn(projectSettingsRepository, 'deleteSettings').mockResolvedValue();

      await controller.deleteRepositorySettings(req, res, next);
      expect(projectSettingsRepository.deleteSettings).toHaveBeenCalledWith(
        req.params.repositoryId,
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({ message: 'Settings deleted' });
    });

    it('should call next with error if deleteSettings throws', async () => {
      const error = new Error('Database error');
      vi.spyOn(projectSettingsRepository, 'deleteSettings').mockRejectedValue(
        error,
      );

      await controller.deleteRepositorySettings(req, res, next);
      expect(projectSettingsRepository.deleteSettings).toHaveBeenCalledWith(
        req.params.repositoryId,
      );
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
