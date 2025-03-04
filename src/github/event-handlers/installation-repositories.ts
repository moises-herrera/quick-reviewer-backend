import {
  EmitterWebhookEvent,
  HandlerFunction,
} from '@octokit/webhooks/dist-types/types';
import { prisma } from 'src/database/db-connection';

const addRepositories = async (
  payload: EmitterWebhookEvent<'installation_repositories.added'>['payload'],
) => {
  if (payload.repositories_added.length) {
    const repositoriesMapped =
      payload.repositories_added?.map((data) => ({
        id: data.node_id,
        name: data.full_name,
        ownerId: payload.installation.account?.node_id as string,
      })) || [];

    await prisma.repository.createMany({
      data: repositoriesMapped,
    });
  }
};

const removeRepositories = async (
  payload: EmitterWebhookEvent<'installation_repositories.removed'>['payload'],
) => {
  if (payload.repositories_removed.length) {
    const repositoriesIds = payload.repositories_removed.map(
      ({ node_id }) => node_id,
    );

    try {
      await prisma.pullRequest.deleteMany({
        where: {
          repositoryId: {
            in: repositoriesIds,
          },
        },
      });
    } catch (error) {
      console.error('Error deleting pull requests:', error);
    }

    await prisma.repository.deleteMany({
      where: {
        id: {
          in: repositoriesIds,
        },
      },
    });
  }
};

export const handleAppInstallationRepositories: HandlerFunction<
  'installation_repositories'
> = async ({ payload }) => {
  switch (payload.action) {
    case 'added':
      await addRepositories(payload);
      break;

    case 'removed':
      await removeRepositories(payload);
      break;

    default:
      break;
  }
};
