import { EmitterWebhookEvent } from '@octokit/webhooks';
import { PullRequestMapper } from 'src/github/mappers/pull-request.mapper';

describe('PullRequestMapper', () => {
  it('should map GitHub pull request to internal pull request', () => {
    const data: {
      pullRequest: EmitterWebhookEvent<'pull_request.opened'>['payload']['pull_request'];
      repositoryId: number | string;
    } = {
      pullRequest: {
        id: 123,
        node_id: 'abc',
        number: 1,
        title: 'Test PR',
        body: 'This is a test PR',
        state: 'open',
        url: 'https://www.github.com/test/test/pull/1',
        additions: 10,
        deletions: 5,
        changed_files: 2,
        user: { login: 'test-user' },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        closed_at: null,
        base: { sha: 'base-sha' },
        head: { sha: 'head-sha' },
      } as EmitterWebhookEvent<'pull_request.opened'>['payload']['pull_request'],
      repositoryId: 456,
    };
    const expectedResult = {
      id: '123',
      nodeId: 'abc',
      number: 1,
      title: 'Test PR',
      body: 'This is a test PR',
      state: 'open',
      url: 'https://www.github.com/test/test/pull/1',
      additions: 10,
      deletions: 5,
      changedFiles: 2,
      repositoryId: '456',
      author: 'test-user',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
      closedAt: null,
      mergedAt: null,
      baseSha: 'base-sha',
      headSha: 'head-sha',
    };

    const mappedPullRequest =
      PullRequestMapper.mapPullRequestWithRepository(data);

    expect(mappedPullRequest).toEqual(expectedResult);
  });
});
