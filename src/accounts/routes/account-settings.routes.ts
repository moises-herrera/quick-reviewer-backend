import { Router } from 'express';
import { container } from 'src/app/config/container-config';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { AccountSettingsController } from 'src/accounts/controllers/account-settings.controller';
import { accountSettingsPermissionsMiddleware } from 'src/accounts/middlewares/account-settings-permissions.middleware';
import { BotSettingsSchema } from 'src/common/schemas/bot-settings.schema';

const accountSettingsRouter = Router();

const registerRoutes = () => {
  const controller = container.get(AccountSettingsController);

  accountSettingsRouter.use(accountSettingsPermissionsMiddleware);

  /**
   * @swagger
   * /api/accounts/{accountId}/settings:
   *   get:
   *     summary: Get all account settings
   *     description: Retrieves all account settings for the authenticated user
   *     tags: [Accounts]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         description: The ID of the account to retrieve settings for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successful response
   *       500:
   *         description: Internal server error
   */
  accountSettingsRouter.get(
    '/:accountId/settings',
    controller.getAccountSettings,
  );

  /**
   * @swagger
   * /api/accounts/{accountId}/settings:
   *   put:
   *     summary: Update account settings
   *     description: Updates the settings for a specific account
   *     tags: [Accounts]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         description: The ID of the account to update settings for
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BotSettings'
   *     responses:
   *       200:
   *         description: Successful response
   *       400:
   *         description: Bad request
   *       404:
   *         description: Account not found
   */
  accountSettingsRouter.put(
    '/:accountId/settings',
    validateBody(BotSettingsSchema),
    controller.updateAccountSettings,
  );
};

registerRoutes();

export { accountSettingsRouter };
