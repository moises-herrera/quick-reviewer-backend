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
  },
  repository,
}: EmitterWebhookEvent<'pull_request.opened'>['payload']): PullRequest =>
  ({
    id,
    number,
    title,
    state,
    url,
    additions,
    deletions,
    changedFiles: changed_files,
    repositoryId: repository.node_id,
    author: user.login,
    createdAt: new Date(created_at),
    updatedAt: new Date(created_at),
  }) as unknown as PullRequest;
