import { Router } from 'express';
import { repositorySettingsPermissionsMiddleware } from 'src/repositories/middlewares/repository-settings-permissions.middleware';
import { container } from 'src/app/config/container-config';
import { RepositorySettingsController } from 'src/repositories/controllers/repository-settings.controller';
import { validateBody } from 'src/common/middlewares/validate-data.middleware';
import { BotSettingsSchema } from 'src/common/schemas/bot-settings.schema';

/**
 * @swagger
 * tags:
 *   name: Repository
 *   description: API for managing repository settings
 */
const repositorySettingsRouter = Router();

export const registerRoutes = () => {
  const controller = container.get(RepositorySettingsController);

  /**
   * @swagger
   * /api/repositories/{repositoryId}/settings:
   *   get:
   *    summary: Get the settings of a repository
   *    description: Retrieves the settings for a specific repository
   *    tags: [Repository]
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
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/BotSettings'
   *      404:
   *        description: Repository settings not found
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/StandardResponse'
   *      500:
   *        description: Internal server error
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/StandardResponse'
   */
  repositorySettingsRouter.get(
    '/:repositoryId/settings',
    repositorySettingsPermissionsMiddleware,
    controller.getRepositorySettings,
  );

  /**
   * @swagger
   * /api/repositories/{repositoryId}/settings:
   *   put:
   *     summary: Update repository settings
   *     description: Updates the settings for a specific repository
   *     tags: [Repository]
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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       400:
   *         description: Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  repositorySettingsRouter.put(
    '/:repositoryId/settings',
    repositorySettingsPermissionsMiddleware,
    validateBody(BotSettingsSchema),
    controller.updateRepositorySettings,
  );

  /**
   * @swagger
   * /api/repositories/{repositoryId}/settings:
   *   delete:
   *     summary: Delete repository settings
   *     description: Deletes the settings for a specific repository
   *     tags: [Repository]
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
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       404:
   *         description: Repository settings not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/StandardResponse'
   */
  repositorySettingsRouter.delete(
    '/:repositoryId/settings',
    repositorySettingsPermissionsMiddleware,
    controller.deleteRepositorySettings,
  );
};

registerRoutes();

export { repositorySettingsRouter };
