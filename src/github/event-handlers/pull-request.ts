import {
  EmitterWebhookEvent,
  HandlerFunction,
} from '@octokit/webhooks/dist-types/types';
import { prisma } from 'src/database/db-connection';
import { mapPullRequestToCreation } from '../mappers/pull-request.mapper';

const handlePullRequestCreation = async (
  payload: EmitterWebhookEvent<'pull_request.opened'>['payload'],
) => {
  try {
    await prisma.pullRequest.create({
      data: mapPullRequestToCreation(payload),
    });
  } catch (error) {
    console.error('Error creating pull request:', error);
  }
};

const handlePullRequestClosure = async (
  payload: EmitterWebhookEvent<'pull_request.closed'>['payload'],
) => {
  try {
    await prisma.pullRequest.update({
      where: {
        id: payload.pull_request.node_id,
      },
      data: {
        state: payload.pull_request.state,
        closedAt: new Date(payload.pull_request.closed_at || Date.now()),
      },
    });
  } catch (error) {
    console.error('Error closing pull request:', error);
  }
};

const handlePullRequestReopening = async (
  payload: EmitterWebhookEvent<'pull_request.reopened'>['payload'],
) => {
  try {
    await prisma.pullRequest.update({
      where: {
        id: payload.pull_request.node_id,
      },
      data: {
        state: payload.pull_request.state,
        closedAt: null,
      },
    });
  } catch (error) {
    console.error('Error reopening pull request:', error);
  }
};

const handlePullRequestSynchronization = async (
  payload: EmitterWebhookEvent<'pull_request.synchronize'>['payload'],
) => {
  try {
    await prisma.pullRequest.update({
      where: {
        id: payload.pull_request.node_id,
      },
      data: {
        additions: payload.pull_request.additions,
        deletions: payload.pull_request.deletions,
        changedFiles: payload.pull_request.changed_files,
      },
    });
  } catch (error) {
    console.error('Error synchronizing pull request:', error);
  }
};

export const handlePullRequestEvent: HandlerFunction<'pull_request'> = async ({
  payload,
}) => {
  switch (payload.action) {
    case 'opened':
      await handlePullRequestCreation(payload);
      break;

    case 'closed':
      await handlePullRequestClosure(payload);
      break;

    case 'reopened':
      await handlePullRequestReopening(payload);
      break;

    case 'synchronize':
      await handlePullRequestSynchronization(payload);
      break;

    default:
      break;
  }
};
