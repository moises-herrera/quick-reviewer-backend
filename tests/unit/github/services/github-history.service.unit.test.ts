import { Repository } from '@prisma/client';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { Octokit } from 'src/github/interfaces/octokit';
import { GitHubHistoryService } from 'src/github/services/github-history.service';
import { MockCodeReviewRepository } from 'tests/mocks/mock-code-review.repository';
import { MockPullRequestRepository } from 'tests/mocks/mock-pull-request.repository';

describe('GitHubHistoryService', () => {
  let service: GitHubHistoryService;
  let pullRequestRepository: PullRequestRepository;
  let codeReviewRepository: CodeReviewRepository;
  const mockOctokit = {
    rest: {
      search: {
        issuesAndPullRequests: vi.fn(),
      },
      pulls: {
        get: vi.fn(),
        listReviews: vi.fn(),
      },
    },
  } as unknown as Octokit;

  beforeEach(() => {
    pullRequestRepository =
      new MockPullRequestRepository() as unknown as PullRequestRepository;
    codeReviewRepository =
      new MockCodeReviewRepository() as unknown as CodeReviewRepository;
    service = new GitHubHistoryService(
      pullRequestRepository,
      codeReviewRepository,
    );

    service.setGitProvider(mockOctokit);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should record the history of pull requests and code reviews', async () => {
    vi.spyOn(
      mockOctokit.rest.search,
      'issuesAndPullRequests',
    ).mockResolvedValue({
      data: {
        items: Array.from({ length: 2 }).map((_, index) => ({
          number: index + 1,
        })),
        total_count: 2,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);

    vi.spyOn(mockOctokit.rest.pulls, 'get').mockResolvedValueOnce({
      data: {
        id: 1,
        node_id: '1',
        number: 1,
        title: 'Pull Request Title',
        user: {
          login: 'user1',
        },
        created_at: new Date(),
        updated_at: new Date(),
        closed_at: new Date(),
        merged_at: new Date(),
        state: 'closed',
        url: 'https://example.com',
        additions: 10,
        deletions: 5,
        changed_files: 3,
        base: {
          repo: {
            id: 1,
          },
          sha: 'base-sha',
        },
        head: {
          sha: 'head-sha',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);

    vi.spyOn(mockOctokit.rest.pulls, 'get').mockResolvedValueOnce({
      data: {
        id: 2,
        node_id: '2',
        number: 2,
        title: 'Pull Request Title',
        user: {
          login: 'user1',
        },
        created_at: new Date(),
        updated_at: new Date(),
        closed_at: new Date(),
        merged_at: new Date(),
        state: 'closed',
        url: 'https://example.com',
        additions: 20,
        deletions: 2,
        changed_files: 10,
        base: {
          repo: {
            id: 1,
          },
          sha: 'base-sha',
        },
        head: {
          sha: 'head-sha',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);

    vi.spyOn(mockOctokit.rest.pulls, 'listReviews').mockResolvedValueOnce({
      data: [
        {
          id: 1,
          user: {
            login: 'user1',
            type: 'User',
          },
          body: 'Code review comment',
          submitted_at: new Date(),
          commit_id: 'commit-sha-1',
          state: 'approved',
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);

    vi.spyOn(mockOctokit.rest.pulls, 'listReviews').mockResolvedValueOnce({
      data: [
        {
          id: 2,
          user: {
            login: 'user2',
            type: 'User',
          },
          body: 'Another code review comment',
          submitted_at: new Date(),
          commit_id: 'commit-sha-2',
          state: 'commented',
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any);

    const spySavePullRequests = vi.spyOn(
      pullRequestRepository,
      'savePullRequests',
    );
    const spySaveCodeReviews = vi.spyOn(
      codeReviewRepository,
      'saveCodeReviews',
    );

    const repositories: Repository[] = [
      {
        id: '1',
        name: 'test-repo',
        ownerId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await service.recordHistory('github-owner', repositories);

    expect(spySavePullRequests).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '2',
        nodeId: '2',
      }),
      expect.objectContaining({
        id: '1',
        nodeId: '1',
      }),
    ]);
    expect(spySaveCodeReviews).toHaveBeenCalledTimes(2);
  });
});
