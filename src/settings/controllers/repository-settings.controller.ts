import { StatusCodes } from 'http-status-codes';
import { inject } from 'inversify';
import { ProjectSettingsRepository } from 'src/common/database/abstracts/project-settings.repository';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export class RepositorySettingsController {
  constructor(
    @inject(ProjectSettingsRepository)
    private readonly projectSettingsRepository: ProjectSettingsRepository,
  ) {}

  getRepositorySettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { accountId } = req.params;
      const settings =
        await this.projectSettingsRepository.getSettings(accountId);
      res.status(StatusCodes.OK).json(settings);
    } catch (error) {
      next(error);
    }
  };

  updateRepositorySettings: AuthHttpHandler = async (req, res, next) => {
    try {
      const { repositoryId } = req.params;
      const settings = req.body;
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
