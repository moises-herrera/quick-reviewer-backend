import {
  EmitterWebhookEvent,
  HandlerFunction,
} from '@octokit/webhooks/dist-types/types';
import { AccountType, Repository } from '@prisma/client';
import { prisma } from 'src/database/db-connection';

const handleAppCreation = async (
  payload: EmitterWebhookEvent<'installation.created'>['payload'],
) => {
  if (payload.installation.account && 'login' in payload.installation.account) {
    try {
      const repositoriesMapped =
        payload.repositories?.map(
          (data) =>
            <Repository>{
              id: data.id as unknown as bigint,
              name: data.full_name,
            },
        ) || [];

      await prisma.account.create({
        data: {
          id: payload.installation.account?.id,
          name: payload.installation.account?.login,
          type: payload.installation.account?.type as AccountType,
          repositories: {
            createMany: {
              data: repositoriesMapped,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating account:', error);
    }
  }
};

const handleAppDeletion = async (
  payload: EmitterWebhookEvent<'installation.deleted'>['payload'],
) => {
  try {
    await prisma.repository.deleteMany({
      where: {
        ownerId: payload.installation.account?.id,
      },
    });
  } catch (error) {
    console.error('Error deleting repositories:', error);
  }

  if (payload.installation.account && 'login' in payload.installation.account) {
    try {
      await prisma.account.delete({
        where: {
          id: payload.installation.account?.id,
        },
      });
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  }
};

const handleNewPermissionsAccepted = async (
  payload: EmitterWebhookEvent<'installation.new_permissions_accepted'>['payload'],
) => {
  console.log(payload);
};

export const handleAppInstallation: HandlerFunction<'installation'> = async ({
  payload,
}) => {
  switch (payload.action) {
    case 'created':
      await handleAppCreation(payload);
      break;

    case 'deleted':
      await handleAppDeletion(payload);
      break;

    case 'new_permissions_accepted':
      await handleNewPermissionsAccepted(payload);
      break;

    default:
      break;
  }
};
