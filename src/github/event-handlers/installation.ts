import {
  EmitterWebhookEvent,
  HandlerFunction,
} from '@octokit/webhooks/dist-types/types';
import { prisma } from 'src/database/db-connection';
import { mapRepositoriesToCreation } from '../mappers/repository.mapper';
import { mapAccountToCreation } from '../mappers/account.mapper';
import { savePullRequestsHistoryByRepository } from '../services/pull-request.service';
import { Octokit } from 'octokit';

const handleAppCreation = async (
  octokit: Octokit,
  payload: EmitterWebhookEvent<'installation.created'>['payload'],
) => {
  if (payload.installation.account && 'login' in payload.installation.account) {
    try {
      const repositoriesMapped = mapRepositoriesToCreation(
        payload.repositories || [],
      );

      const account = await prisma.account.create({
        data: {
          ...mapAccountToCreation(payload.installation.account),
          repositories: {
            createMany: {
              data: repositoriesMapped,
            },
          },
        },
      });

      const pullRequestsPromises = repositoriesMapped.map(({ name }) => {
        return savePullRequestsHistoryByRepository(octokit, account.name, name);
      });

      await Promise.all(pullRequestsPromises);
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
        ownerId: payload.installation.account?.node_id,
      },
    });
  } catch (error) {
    console.error('Error deleting repositories:', error);
  }

  if (payload.installation.account && 'login' in payload.installation.account) {
    try {
      await prisma.account.delete({
        where: {
          id: payload.installation.account?.node_id,
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

export const handleAppInstallation: HandlerFunction<
  'installation',
  {
    octokit: Octokit;
    payload: EmitterWebhookEvent<'installation'>['payload'];
  }
> = async ({ octokit, payload }) => {
  switch (payload.action) {
    case 'created':
      await handleAppCreation(octokit as Octokit, payload);
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
