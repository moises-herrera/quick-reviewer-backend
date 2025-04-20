import { Router } from 'express';
import { container } from 'src/app/config/container-config';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { AccountSettingsController } from 'src/settings/controllers/account-settings.controller';
import { accountSettingsPermissionsMiddleware } from 'src/settings/middlewares/account-settings-permissions.middleware';
import { BotSettingsSchema } from 'src/common/schemas/bot-settings.schema';

/**
 * @swagger
 * tags:
 *   name: Account Settings
 *   description: Endpoints for managing account settings
 */
const accountSettingsRouter = Router();

const registerRoutes = () => {
  const controller = container.get(AccountSettingsController);

  accountSettingsRouter.use(gitHubAuthMiddleware);
  accountSettingsRouter.use(accountSettingsPermissionsMiddleware);

  /**
   * @swagger
   * /api/settings/account-settings:
   *   get:
   *     summary: Get all account settings
   *     description: Retrieves all account settings for the authenticated user
   *     tags: [Account Settings]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: query
   *         name: accountId
   *         required: true
   *         description: The ID of the account to retrieve settings for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successful response
   *       404:
   *         description: Account not found
   *       500:
   *         description: Internal server error
   */
  accountSettingsRouter.get('/:accountId', controller.getAccountSettings);

  /**
   * @swagger
   * /api/settings/account-settings/{accountId}:
   *   put:
   *     summary: Update account settings
   *     description: Updates the settings for a specific account
   *     tags: [Account Settings]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         description: The ID of the account to update settings for
   *         schema:
   *           type: string
   *       - in: body
   *         name: body
   *         required: true
   *         description: The new settings for the account
   *         schema:
   *           $ref: '#/components/schemas/BotSettings'
   *     responses:
   *       200:
   *         description: Successful response
   *       400:
   *         description: Bad request
   *       404:
   *         description: Account not found
   */
  accountSettingsRouter.put(
    '/:accountId',
    validateBody(BotSettingsSchema),
    controller.updateAccountSettings,
  );
};

registerRoutes();

export { accountSettingsRouter };
