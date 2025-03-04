import { EmitterWebhookEvent } from '@octokit/webhooks';
import { HandlerFunction } from '@octokit/webhooks/dist-types/types';
import { prisma } from 'src/database/db-connection';

const handleRepositoryCreation = async (
  payload: EmitterWebhookEvent<'repository.created'>['payload'],
) => {
  try {
    await prisma.repository.create({
      data: {
        id: payload.repository.node_id,
        name: payload.repository.name,
        ownerId: payload.repository.owner.node_id,
      },
    });
  } catch (error) {
    console.error('Error creating repository:', error);
  }
};

const handleRepositoryDeletion = async (
  payload: EmitterWebhookEvent<'repository.deleted'>['payload'],
) => {
  try {
    await prisma.repository.delete({
      where: {
        id: payload.repository.node_id,
      },
    });
  } catch (error) {
    console.error('Error deleting repository:', error);
  }
};

const handleRepositoryRenamed = async (
  payload: EmitterWebhookEvent<'repository.renamed'>['payload'],
) => {
  try {
    await prisma.repository.update({
      where: {
        id: payload.repository.node_id,
      },
      data: {
        name: payload.repository.name,
      },
    });
  } catch (error) {
    console.error('Error editing repository:', error);
  }
};

export const handleRepositoryEvent: HandlerFunction<'repository'> = async ({
  payload,
}) => {
  switch (payload.action) {
    case 'created':
      await handleRepositoryCreation(payload);
      break;

    case 'deleted':
      await handleRepositoryDeletion(payload);
      break;

    case 'renamed':
      await handleRepositoryRenamed(payload);
      break;

    default:
      break;
  }
};
