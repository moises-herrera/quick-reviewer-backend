import { Router } from 'express';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';
import { repositorySettingsPermissionsMiddleware } from 'src/settings/middlewares/repository-settings-permissions.middleware';
import { container } from 'src/app/config/container-config';
import { RepositorySettingsController } from 'src/settings/controllers/repository-settings.controller';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { BotSettingsSchema } from 'src/common/schemas/bot-settings.schema';

/**
 * @swagger
 * tags:
 *   name: Repository Settings
 *   description: API for managing repository settings
 */
const repositorySettingsRouter = Router();

const registerRoutes = () => {
  const controller = container.get(RepositorySettingsController);

  // repositorySettingsRouter.use(gitHubAuthMiddleware);
  repositorySettingsRouter.use(repositorySettingsPermissionsMiddleware);

  /**
   * @swagger
   * /api/settings/repository-settings/{repositoryId}:
   *   get:
   *    summary: Get the settings of a repository
   *    description: Retrieves the settings for a specific repository
   *    tags: [Repository Settings]
   *    security:
   *      - githubAuth: []
   *    parameters:
   *       - in: path
   *         name: repositoryId
   *         required: true
   *         description: The ID of the repository to retrieve settings for
   *         schema:
   *           type: string
   *    responses:
   *      200:
   *        description: Successful response with repository settings
   *      404:
   *        description: Repository settings not found
   *      500:
   *        description: Internal server error
   */
  repositorySettingsRouter.get(
    '/:repositoryId',
    controller.getRepositorySettings,
  );

  /**
   * @swagger
   * /api/settings/repository-settings/{repositoryId}:
   *   put:
   *     summary: Update repository settings
   *     description: Updates the settings for a specific repository
   *     tags: [Repository Settings]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: path
   *         name: repositoryId
   *         required: true
   *         description: The ID of the repository to update settings for
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
   *         description: Successful response with updated settings
   *       400:
   *         description: Invalid input data
   *       500:
   *         description: Internal server error
   */
  repositorySettingsRouter.put(
    '/:repositoryId',
    validateBody(BotSettingsSchema),
    controller.updateRepositorySettings,
  );

  /**
   * @swagger
   * /api/settings/repository-settings/{repositoryId}:
   *   delete:
   *     summary: Delete repository settings
   *     description: Deletes the settings for a specific repository
   *     tags: [Repository Settings]
   *     security:
   *       - githubAuth: []
   *     parameters:
   *       - in: path
   *         name: repositoryId
   *         required: true
   *         description: The ID of the repository to delete settings for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successful response with deletion confirmation
   *       404:
   *         description: Repository settings not found
   *       500:
   *         description: Internal server error
   */
  repositorySettingsRouter.delete(
    '/:repositoryId',
    controller.deleteRepositorySettings,
  );
};

registerRoutes();

export { repositorySettingsRouter };
