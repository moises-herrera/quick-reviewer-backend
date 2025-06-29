import { StatusCodes } from 'http-status-codes';
import { inject } from 'inversify';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';
import { HttpException } from 'src/common/exceptions/http-exception';
import { BotSettings } from 'src/common/interfaces/bot-settings';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export class RepositorySettingsController {
  constructor(
    @inject(ProjectSettingsRepository)
    private readonly projectSettingsRepository: ProjectSettingsRepository,
  ) {}

  getRepositorySettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { repositoryId } = req.params;
      const settings =
        await this.projectSettingsRepository.getSettings(repositoryId);

      if (!settings) {
        throw new HttpException(
          'Repository settings not found',
          StatusCodes.NOT_FOUND,
        );
      }

      const botSettings: BotSettings = {
        autoReviewEnabled: settings.autoReviewEnabled,
        requestChangesWorkflowEnabled: settings.requestChangesWorkflowEnabled,
      };

      res.status(StatusCodes.OK).json(botSettings);
    } catch (error) {
      next(error);
    }
  };

  updateRepositorySettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { repositoryId } = req.params;
      const settings = req.body as BotSettings;
      await this.projectSettingsRepository.setSettings(repositoryId, settings);
      res.status(StatusCodes.OK).json({ message: 'Settings updated' });
    } catch (error) {
      next(error);
    }
  };

  deleteRepositorySettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { repositoryId } = req.params;
      await this.projectSettingsRepository.deleteSettings(repositoryId);
      res.status(StatusCodes.OK).json({ message: 'Settings deleted' });
    } catch (error) {
      next(error);
    }
  };
}
