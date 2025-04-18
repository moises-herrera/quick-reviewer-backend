import { Router } from 'express';
import { container } from 'src/app/config/container-config';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { AccountSettingsController } from 'src/settings/controllers/account-settings.controller';
import { accountSettingsPermissionsMiddleware } from 'src/settings/middlewares/account-settings-permissions.middleware';

const accountSettingsRouter = Router();

const registerRoutes = () => {
  const controller = container.get(AccountSettingsController);

  accountSettingsRouter.use(gitHubAuthMiddleware);
  accountSettingsRouter.use(accountSettingsPermissionsMiddleware);

  accountSettingsRouter.get('/:accountId', controller.getAccountSettings);
  accountSettingsRouter.put('/:accountId', controller.updateAccountSettings);
};

registerRoutes();

export { accountSettingsRouter };
