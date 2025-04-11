import { PullRequestCommentMapper } from 'src/github/mappers/pull-request-comment.mapper';

describe('PullRequestCommentMapper', () => {
  it('should map pull request comment data to PullRequestComment model', () => {
    const data = {
      id: 123,
      body: 'This is a comment',
      user: {
        login: 'octocat',
        type: 'User',
      },
      created_at: '2023-10-01T00:00:00Z',
      updated_at: '2023-10-01T00:00:00Z',
    };

    const options = {
      pullRequestId: '456',
      commitId: '789',
    };

    const expectedResult = {
      id: '123',
      body: 'This is a comment',
      user: 'octocat',
      userType: 'User',
      createdAt: new Date('2023-10-01T00:00:00Z'),
      updatedAt: new Date('2023-10-01T00:00:00Z'),
      commitId: '789',
      pullRequestId: '456',
    };

    const result = PullRequestCommentMapper.mapPullRequestComment(
      data,
      options,
    );

    expect(result).toEqual(expectedResult);
  });
});
