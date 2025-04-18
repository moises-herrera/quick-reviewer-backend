import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { repositorySettingsPermissionsMiddleware } from 'src/settings/middlewares/repository-settings-permissions.middleware';
import { container } from 'src/app/config/container-config';
import { RepositorySettingsController } from 'src/settings/controllers/repository-settings.controller';

const repositorySettingsRouter = Router();

const registerRoutes = () => {
  const controller = container.get(RepositorySettingsController);

  repositorySettingsRouter.use(gitHubAuthMiddleware);
  repositorySettingsRouter.use(repositorySettingsPermissionsMiddleware);

  repositorySettingsRouter.get('/account/:accountId', controller.getRepositorySettings);
  repositorySettingsRouter.put(
    '/:repositoryId',
    controller.updateRepositorySettings,
  );
  repositorySettingsRouter.delete(
    '/:repositoryId',
    controller.deleteRepositorySettings,
  );
};

registerRoutes();

export { repositorySettingsRouter };
