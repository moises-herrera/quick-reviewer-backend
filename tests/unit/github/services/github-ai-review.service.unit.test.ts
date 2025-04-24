import { CodeReview, PullRequest, PullRequestComment } from '@prisma/client';
import { AIService } from 'src/ai/abstracts/ai.service';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { PullRequestCommentRepository } from 'src/common/database/abstracts/pull-request-comment.repository';
import { BOT_USER_REFERENCE } from 'src/github/constants/bot';
import { AIPullRequestReview } from 'src/github/interfaces/ai-pull-request-review';
import { Octokit } from 'src/github/interfaces/octokit';
import { GitHubAIReviewService } from 'src/github/services/github-ai-review.service';
import { MockCodeReviewRepository } from 'tests/mocks/repositories/mock-code-review.repository';
import { MockPullRequestCommentRepository } from 'tests/mocks/repositories/mock-pull-request-comment.repository';
import { MockAIService } from 'tests/mocks/services/mock-ai.service';
import { MockLoggerService } from 'tests/mocks/services/mock-logger.service';

describe('GitHubAIReviewService', () => {
  let service: GitHubAIReviewService;
  let aiService: AIService;
  let pullRequestCommentRepository: PullRequestCommentRepository;
  let codeReviewRepository: CodeReviewRepository;
  let loggerService: LoggerService;
  let octokit: Octokit;

  const response = 'AI generated summary';
  const repository = {
    name: 'test-repo',
    owner: 'test-owner',
  };
  const pullRequest: PullRequest = {
    id: '1',
    nodeId: 'a',
    number: 1,
    state: 'OPEN',
    title: 'Test PR',
    body: 'Test body',
    additions: 10,
    deletions: 5,
    changedFiles: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    closedAt: null,
    mergedAt: null,
    author: 'test-author',
    headSha: 'abc123',
    baseSha: 'def456',
    repositoryId: '1',
    url: 'htttps://github.com/test-owner/test-repo/pull/1',
  };
  const summary = `${response}\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`;
  const comment = {
    owner: repository.owner,
    repo: repository.name,
    issue_number: pullRequest.number,
    body: summary,
  };
  const commentMapped: PullRequestComment = {
    id: '1',
    body: summary,
    user: 'bot',
    userType: 'Bot',
    createdAt: new Date('2023-10-01T00:00:00Z'),
    updatedAt: new Date('2023-10-01T00:00:00Z'),
    pullRequestId: pullRequest.id,
    commitId: 'abc123',
    type: 'summary',
  };
  const changedFiles = [
    {
      filename: 'test-file.js',
      additions: 10,
      deletions: 5,
      changes: 15,
    },
    {
      filename: 'test-file2.js',
      additions: 20,
      deletions: 10,
      changes: 30,
    },
  ];

  beforeEach(() => {
    octokit = {
      rest: {
        repos: {
          compareCommitsWithBasehead: vi.fn(),
        },
        issues: {
          createComment: vi.fn(),
          updateComment: vi.fn(),
        },
        pulls: {
          createReview: vi.fn(),
          listFiles: vi.fn(),
        },
      },
    } as unknown as Octokit;
    aiService = new MockAIService();
    pullRequestCommentRepository = new MockPullRequestCommentRepository();
    codeReviewRepository = new MockCodeReviewRepository();
    loggerService = new MockLoggerService();
    service = new GitHubAIReviewService(
      aiService,
      pullRequestCommentRepository,
      codeReviewRepository,
      loggerService,
    );
    service.setGitProvider(octokit);
  });

  describe('generatePullRequestSummary', () => {
    it('should generate a new summary for a pull request', async () => {
      const spyGetPullRequestComment = vi
        .spyOn(pullRequestCommentRepository, 'getPullRequestComment')
        .mockResolvedValue(null);
      const spyListFiles = vi
        .spyOn(octokit.rest.pulls, 'listFiles')
        .mockResolvedValue({
          status: 200,
          data: changedFiles,
        } as Awaited<ReturnType<Octokit['rest']['pulls']['listFiles']>>);
      const spySendMessage = vi
        .spyOn(aiService, 'sendMessage')
        .mockResolvedValue(response);
      const spyCreateComment = vi
        .spyOn(octokit.rest.issues, 'createComment')
        .mockResolvedValue({
          status: 200,
          data: {
            id: 1,
            body: summary,
            user: {
              login: 'bot',
              type: 'Bot',
            },
            created_at: '2023-10-01T00:00:00Z',
            updated_at: '2023-10-01T00:00:00Z',
          },
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['issues']['createComment']>
        >);
      const spySavePullRequestComment = vi
        .spyOn(pullRequestCommentRepository, 'savePullRequestComment')
        .mockResolvedValue(commentMapped);

      await service.generatePullRequestSummary({
        repository,
        pullRequest,
      });

      expect(spyGetPullRequestComment).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        user: BOT_USER_REFERENCE,
        type: 'summary',
        userType: 'Bot',
      });
      expect(spyListFiles).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
      });
      expect(spySendMessage).toHaveBeenCalled();
      expect(spyCreateComment).toHaveBeenCalledWith(comment);
      expect(spySavePullRequestComment).toHaveBeenCalledWith(commentMapped);
    });

    it('should update an existing summary for a pull request', async () => {
      const pullRequestToReview: PullRequest = {
        ...pullRequest,
        headSha: 'new-sha',
      };
      const spyGetPullRequestComment = vi
        .spyOn(pullRequestCommentRepository, 'getPullRequestComment')
        .mockResolvedValue(commentMapped);
      const spyCompareCommitsWithBasehead = vi
        .spyOn(octokit.rest.repos, 'compareCommitsWithBasehead')
        .mockResolvedValue({
          status: 200,
          data: {
            files: changedFiles,
          },
        } as Awaited<
          ReturnType<Octokit['rest']['repos']['compareCommitsWithBasehead']>
        >);
      const spySendMessage = vi
        .spyOn(aiService, 'sendMessage')
        .mockResolvedValue(response);
      const spyUpdateComment = vi
        .spyOn(octokit.rest.issues, 'updateComment')
        .mockResolvedValue({
          status: 200,
          data: {
            id: 1,
            body: summary,
            user: {
              login: 'bot',
              type: 'Bot',
            },
            created_at: '2023-10-01T00:00:00Z',
            updated_at: '2023-10-01T00:00:00Z',
          },
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['issues']['updateComment']>
        >);
      const spyUpdatePullRequestComment = vi.spyOn(
        pullRequestCommentRepository,
        'updatePullRequestComment',
      );

      const expectedMessageParams = {
        systemInstructions: expect.any(String),
        messages: [
          {
            role: 'user',
            content:
              `This is the last pull request summary generated. Preserve the table order and the existing change summary of each file that was not modified. ` +
              `Only add or modify the general summary if it is necessary, considering that new information can be added or removed to the current summary. ` +
              `In the table, only add or modify the latest changed files that are provided: ${comment.body}`,
          },
          {
            role: 'user',
            content: expect.any(String),
          },
        ],
      };

      await service.generatePullRequestSummary({
        repository,
        pullRequest: pullRequestToReview,
      });

      expect(spyGetPullRequestComment).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        user: BOT_USER_REFERENCE,
        type: 'summary',
        userType: 'Bot',
      });
      expect(spyCompareCommitsWithBasehead).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        base: commentMapped.commitId,
        head: pullRequestToReview.headSha,
        basehead: `${commentMapped.commitId}...${pullRequestToReview.headSha}`,
      });
      expect(spySendMessage).toHaveBeenCalledWith(expectedMessageParams);
      expect(spyUpdateComment).toHaveBeenCalledWith({
        ...comment,
        body: `${response}\n\n---\n\nLast commit reviewed: ${pullRequestToReview.headSha}`,
        comment_id: Number(commentMapped.id),
      });
      expect(spyUpdatePullRequestComment).toHaveBeenCalledWith(
        commentMapped.id,
        {
          body: summary,
          commitId: pullRequestToReview.headSha,
        },
      );
    });

    it('should not generate a summary if the pull request has not changed', async () => {
      const spyGetPullRequestComment = vi
        .spyOn(pullRequestCommentRepository, 'getPullRequestComment')
        .mockResolvedValue(commentMapped);
      const spyCreateComment = vi.spyOn(octokit.rest.issues, 'createComment');
      const spySendMessage = vi.spyOn(aiService, 'sendMessage');

      await service.generatePullRequestSummary({
        repository,
        pullRequest,
      });

      expect(spyGetPullRequestComment).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        user: BOT_USER_REFERENCE,
        type: 'summary',
        userType: 'Bot',
      });
      expect(spyCreateComment).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        issue_number: pullRequest.number,
        body: `There are no changes since the last review, so there is no need to update the summary.\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`,
      });
      expect(spySendMessage).not.toHaveBeenCalled();
    });

    it('should log an error if fails when getting the context', async () => {
      vi.spyOn(
        pullRequestCommentRepository,
        'getPullRequestComment',
      ).mockResolvedValue(null);
      vi.spyOn(octokit.rest.pulls, 'listFiles').mockImplementation(() => {
        throw new Error('Failed to get context');
      });
      const spyError = vi.spyOn(loggerService, 'logException');

      await service.generatePullRequestSummary({
        repository,
        pullRequest,
      });

      expect(spyError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          message: 'Error getting pull request context',
        }),
      );
    });

    it('should not generate a summary if the pull request has not changed files', async () => {
      const spyGetPullRequestComment = vi
        .spyOn(pullRequestCommentRepository, 'getPullRequestComment')
        .mockResolvedValue(null);
      const spyListFiles = vi
        .spyOn(octokit.rest.pulls, 'listFiles')
        .mockResolvedValue({
          status: 200,
          data: [],
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['pulls']['listFiles']>
        >);
      const spySendMessage = vi.spyOn(aiService, 'sendMessage');
      const spyCreateComment = vi.spyOn(octokit.rest.issues, 'createComment');

      await service.generatePullRequestSummary({
        repository,
        pullRequest,
      });

      expect(spyGetPullRequestComment).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        user: BOT_USER_REFERENCE,
        type: 'summary',
        userType: 'Bot',
      });
      expect(spyListFiles).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
      });
      expect(spySendMessage).not.toHaveBeenCalled();
      expect(spyCreateComment).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        issue_number: pullRequest.number,
        body: `No changes detected.\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`,
      });
    });

    it('should log an error if fails when generating the summary', async () => {
      const spyGetPullRequestComment = vi
        .spyOn(pullRequestCommentRepository, 'getPullRequestComment')
        .mockResolvedValue(null);
      const spyListFiles = vi
        .spyOn(octokit.rest.pulls, 'listFiles')
        .mockResolvedValue({
          status: 200,
          data: changedFiles,
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['pulls']['listFiles']>
        >);
      const spySendMessage = vi
        .spyOn(aiService, 'sendMessage')
        .mockImplementation(() => {
          throw new Error('Failed to generate summary');
        });
      const spyError = vi.spyOn(loggerService, 'logException');

      await service.generatePullRequestSummary({
        repository,
        pullRequest,
      });

      expect(spyGetPullRequestComment).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        user: BOT_USER_REFERENCE,
        type: 'summary',
        userType: 'Bot',
      });
      expect(spyListFiles).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
      });
      expect(spySendMessage).toHaveBeenCalled();
      expect(spyError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          message: 'Error generating pull request summary',
        }),
      );
    });
  });

  describe('generatePullRequestReview', () => {
    it('should generate a review for a pull request', async () => {
      const review: AIPullRequestReview = {
        generalComment: `## Review\n\n 1 comment.\n\n---\n\nCommit reviewed: ${pullRequest.headSha}`,
        comments: [
          {
            path: 'test-file.js',
            body: 'Test comment',
            line: 1,
            position: 1,
          },
        ],
      };

      const spyGetLastCodeReview = vi
        .spyOn(codeReviewRepository, 'getLastCodeReview')
        .mockResolvedValue(null);
      const spyGetFiles = vi
        .spyOn(octokit.rest.pulls, 'listFiles')
        .mockResolvedValue({
          status: 200,
          data: changedFiles,
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['pulls']['listFiles']>
        >);
      const spySendMessage = vi
        .spyOn(aiService, 'sendMessage')
        .mockResolvedValue(JSON.stringify(review));
      const spyCreateReview = vi.spyOn(octokit.rest.pulls, 'createReview');

      await service.generatePullRequestReview({
        repository,
        pullRequest,
      });

      expect(spyGetLastCodeReview).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        reviewer: BOT_USER_REFERENCE,
        userType: 'Bot',
      });
      expect(spyGetFiles).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
      });
      expect(spySendMessage).toHaveBeenCalledWith({
        systemInstructions: expect.any(String),
        messages: [
          {
            role: 'user',
            content: expect.any(String),
          },
        ],
      });
      expect(spyCreateReview).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
        body: review.generalComment,
        event: 'COMMENT',
        comments: review.comments,
      });
    });

    it('should not generate a review if the pull request has not changed', async () => {
      const codeReview: CodeReview = {
        id: '1',
        pullRequestId: pullRequest.id,
        reviewer: BOT_USER_REFERENCE,
        userType: 'Bot',
        body: `## Review\n\n 1 comment.\n\n---\n\nCommit reviewed: ${pullRequest.headSha}`,
        status: 'COMMENTED',
        commitId: pullRequest.headSha,
        createdAt: new Date(),
      };
      const spyGetLastCodeReview = vi
        .spyOn(codeReviewRepository, 'getLastCodeReview')
        .mockResolvedValue(codeReview);
      const spyCreateComment = vi.spyOn(octokit.rest.issues, 'createComment');

      await service.generatePullRequestReview({
        repository,
        pullRequest,
      });

      expect(spyGetLastCodeReview).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        reviewer: BOT_USER_REFERENCE,
        userType: 'Bot',
      });
      expect(spyCreateComment).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        issue_number: pullRequest.number,
        body: `There are no changes since the last review, so there is no need to add a new review.\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`,
      });
    });

    it('should not generate a review if the pull request has not changed files', async () => {
      const spyGetLastCodeReview = vi
        .spyOn(codeReviewRepository, 'getLastCodeReview')
        .mockResolvedValue(null);
      const spyGetFiles = vi
        .spyOn(octokit.rest.pulls, 'listFiles')
        .mockResolvedValue({
          status: 200,
          data: [],
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['pulls']['listFiles']>
        >);
      const spySendMessage = vi.spyOn(aiService, 'sendMessage');
      const spyCreateReview = vi.spyOn(octokit.rest.pulls, 'createReview');

      await service.generatePullRequestReview({
        repository,
        pullRequest,
      });

      expect(spyGetLastCodeReview).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        reviewer: BOT_USER_REFERENCE,
        userType: 'Bot',
      });
      expect(spyGetFiles).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
      });
      expect(spySendMessage).not.toHaveBeenCalled();
      expect(spyCreateReview).not.toHaveBeenCalled();
    });

    it('should return a message when there are no review comments', async () => {
      const review: AIPullRequestReview = {
        generalComment: `## Review\n\n No relevant changes detected.\n\n---\n\nCommit reviewed: ${pullRequest.headSha}`,
        comments: [],
      };
      const spyGetLastCodeReview = vi
        .spyOn(codeReviewRepository, 'getLastCodeReview')
        .mockResolvedValue(null);
      const spyGetFiles = vi
        .spyOn(octokit.rest.pulls, 'listFiles')
        .mockResolvedValue({
          status: 200,
          data: changedFiles,
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['pulls']['listFiles']>
        >);
      const spySendMessage = vi
        .spyOn(aiService, 'sendMessage')
        .mockResolvedValue(JSON.stringify(review));
      const spyCreateReview = vi.spyOn(octokit.rest.pulls, 'createReview');

      await service.generatePullRequestReview({
        repository,
        pullRequest,
      });

      expect(spyGetLastCodeReview).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        reviewer: BOT_USER_REFERENCE,
        userType: 'Bot',
      });
      expect(spyGetFiles).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
      });
      expect(spySendMessage).toHaveBeenCalledWith({
        systemInstructions: expect.any(String),
        messages: [
          {
            role: 'user',
            content: expect.any(String),
          },
        ],
      });
      expect(spyCreateReview).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
        body: review.generalComment,
        event: 'COMMENT',
        comments: [],
      });
    });

    it('should log an error if fails when getting the context', async () => {
      vi.spyOn(codeReviewRepository, 'getLastCodeReview').mockResolvedValue(
        null,
      );
      vi.spyOn(octokit.rest.pulls, 'listFiles').mockImplementation(() => {
        throw new Error('Failed to get context');
      });
      const spyError = vi.spyOn(loggerService, 'logException');

      await service.generatePullRequestReview({
        repository,
        pullRequest,
      });

      expect(spyError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          message: 'Error getting pull request context',
        }),
      );
    });

    it('should log an error if fails when generating the review', async () => {
      const spyGetLastCodeReview = vi
        .spyOn(codeReviewRepository, 'getLastCodeReview')
        .mockResolvedValue(null);
      const spyGetFiles = vi
        .spyOn(octokit.rest.pulls, 'listFiles')
        .mockResolvedValue({
          status: 200,
          data: changedFiles,
        } as unknown as Awaited<
          ReturnType<Octokit['rest']['pulls']['listFiles']>
        >);
      const spySendMessage = vi
        .spyOn(aiService, 'sendMessage')
        .mockImplementation(() => {
          throw new Error('Failed to generate review');
        });
      const spyError = vi.spyOn(loggerService, 'logException');

      await service.generatePullRequestReview({
        repository,
        pullRequest,
      });

      expect(spyGetLastCodeReview).toHaveBeenCalledWith({
        pullRequestId: pullRequest.id,
        reviewer: BOT_USER_REFERENCE,
        userType: 'Bot',
      });
      expect(spyGetFiles).toHaveBeenCalledWith({
        owner: repository.owner,
        repo: repository.name,
        pull_number: pullRequest.number,
      });
      expect(spySendMessage).toHaveBeenCalled();
      expect(spyError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          message: 'Error generating pull request review',
        }),
      );
    });
  });
});
