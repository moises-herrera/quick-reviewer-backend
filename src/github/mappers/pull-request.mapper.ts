import { EmitterWebhookEvent } from '@octokit/webhooks';
import { PullRequest } from '@prisma/client';

export const mapPullRequestToCreation = ({
  pull_request: {
    id,
    number,
    title,
    state,
    url,
    additions,
    deletions,
    changed_files,
    user,
    created_at,
    updated_at,
    closed_at,
  },
  repository,
}: EmitterWebhookEvent<'pull_request.opened'>['payload']): PullRequest => {
  return {
    id: id as unknown as bigint,
    number,
    title,
    state,
    url,
    additions,
    deletions,
    changedFiles: changed_files,
    repositoryId: repository.id as unknown as bigint,
    author: user.login,
    createdAt: new Date(created_at),
    updatedAt: new Date(updated_at),
    closedAt: closed_at ? new Date(closed_at) : null,
  };
};
