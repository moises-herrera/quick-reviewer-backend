import { EmitterWebhookEvent } from '@octokit/webhooks';
import { PullRequest } from '@prisma/client';

export const mapPullRequestWithRepository = ({
  pullRequest: {
    id,
    node_id,
    number,
    title,
    body,
    state,
    url,
    additions,
    deletions,
    changed_files,
    user,
    created_at,
    updated_at,
    closed_at,
    base: { sha: baseSha },
    head: { sha: headSha },
  },
  repository,
}: {
  pullRequest: EmitterWebhookEvent<'pull_request.opened'>['payload']['pull_request'];
  repository: EmitterWebhookEvent<'pull_request.opened'>['payload']['repository'];
}): PullRequest => {
  return {
    id: id as unknown as bigint,
    nodeId: node_id,
    number,
    title,
    body,
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
    mergedAt: null,
    baseSha,
    headSha,
  };
};
