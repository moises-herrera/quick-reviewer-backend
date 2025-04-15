import { Repository } from '@prisma/client';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';
import { Octokit } from 'src/github/interfaces/octokit';
import { GitHubHistoryService } from 'src/github/services/github-history.service';
import { MockCodeReviewRepository } from 'tests/mocks/repositories/mock-code-review.repository';
import { MockLoggerService } from 'tests/mocks/services/mock-logger.service';
import { MockPullRequestRepository } from 'tests/mocks/repositories/mock-pull-request.repository';

describe('GitHubHistoryService', () => {
  let service: GitHubHistoryService;
  let pullRequestRepository: PullRequestRepository;
  let codeReviewRepository: CodeReviewRepository;
  let loggerService: LoggerService;
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
  const repositories: Repository[] = [
    {
      id: '1',
      name: 'test-repo',
      ownerId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  const pullRequests = [
    {
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
    {
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
  ];
  const codeReviews1 = [
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
  ];
  const codeReviews2 = [
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
  ];

  beforeEach(() => {
    pullRequestRepository =
      new MockPullRequestRepository() as unknown as PullRequestRepository;
    codeReviewRepository =
      new MockCodeReviewRepository() as unknown as CodeReviewRepository;
    loggerService = new MockLoggerService();
    service = new GitHubHistoryService(
      pullRequestRepository,
      codeReviewRepository,
      loggerService,
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
    } as Awaited<
      ReturnType<Octokit['rest']['search']['issuesAndPullRequests']>
    >);

    vi.spyOn(mockOctokit.rest.pulls, 'get').mockResolvedValueOnce({
      data: pullRequests[0],
    } as unknown as Awaited<ReturnType<Octokit['rest']['pulls']['get']>>);

    vi.spyOn(mockOctokit.rest.pulls, 'get').mockResolvedValueOnce({
      data: pullRequests[1],
    } as unknown as Awaited<ReturnType<Octokit['rest']['pulls']['get']>>);

    vi.spyOn(mockOctokit.rest.pulls, 'listReviews').mockResolvedValueOnce({
      data: codeReviews1,
    } as unknown as Awaited<
      ReturnType<Octokit['rest']['pulls']['listReviews']>
    >);

    vi.spyOn(mockOctokit.rest.pulls, 'listReviews').mockResolvedValueOnce({
      data: codeReviews2,
    } as unknown as Awaited<
      ReturnType<Octokit['rest']['pulls']['listReviews']>
    >);

    const spySavePullRequests = vi.spyOn(
      pullRequestRepository,
      'savePullRequests',
    );
    const spySaveCodeReviews = vi.spyOn(
      codeReviewRepository,
      'saveCodeReviews',
    );

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

  it('should handle error when recording history', async () => {
    vi.spyOn(
      mockOctokit.rest.search,
      'issuesAndPullRequests',
    ).mockResolvedValue({
      data: {
        items: [
          {
            number: 1,
          },
        ],
        total_count: 1,
      },
    } as Awaited<
      ReturnType<Octokit['rest']['search']['issuesAndPullRequests']>
    >);

    vi.spyOn(mockOctokit.rest.pulls, 'get').mockResolvedValueOnce({
      data: pullRequests[0],
    } as unknown as Awaited<ReturnType<Octokit['rest']['pulls']['get']>>);

    vi.spyOn(mockOctokit.rest.pulls, 'listReviews').mockImplementation(() => {
      throw new Error('Error fetching code reviews');
    });

    const spySavePullRequests = vi.spyOn(
      pullRequestRepository,
      'savePullRequests',
    );
    const spySaveCodeReviews = vi.spyOn(
      codeReviewRepository,
      'saveCodeReviews',
    );
    const spyError = vi.spyOn(loggerService, 'error');

    await service.recordHistory('github-owner', repositories);

    expect(spyError).toHaveBeenCalled();
    expect(spySavePullRequests).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '1',
        nodeId: '1',
      }),
    ]);
    expect(spySaveCodeReviews).toHaveBeenCalledWith([]);
  });
});
