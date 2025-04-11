import fs from 'node:fs';
import {
  getLanguageFromFilename,
  isExtensionSupported,
} from 'src/common/utils/language-support';
import { PullRequestContext } from 'src/github/interfaces/pull-request-context';
import { Octokit } from 'src/github/interfaces/octokit';
import {
  AIReviewContextParams,
  AIReviewParams,
} from 'src/github/interfaces/review-params';
import { AIPullRequestReview } from 'src/github/interfaces/ai-pull-request-review';
import { PullRequestComment } from '@prisma/client';
import { PullRequestCommentMapper } from 'src/github/mappers/pull-request-comment.mapper';
import { BOT_USER_REFERENCE } from 'src/github/constants/bot';
import { PromptMessage } from 'src/ai/interfaces/prompt-message';
import { RestEndpointMethodTypes } from '@octokit/rest';
import { inject, injectable } from 'inversify';
import { PullRequestCommentRepository } from 'src/common/database/abstracts/pull-request-comment.repository';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';
import { AIService } from 'src/ai/abstracts/ai.service';
import { PullRequestService } from 'src/github/abstracts/pull-request.abstract';
import { LoggerService } from 'src/common/abstracts/logger.abstract';

@injectable()
export class GitHubAIReviewService {
  private octokit: Octokit = {} as Octokit;

  private readonly summaryPrompt = fs.readFileSync(
    `${__dirname}/../../ai/prompts/pull-request-summary.md`,
    'utf8',
  );

  private readonly reviewPrompt = fs.readFileSync(
    `${__dirname}/../../ai/prompts/pull-request-review.md`,
    'utf8',
  );

  constructor(
    @inject(AIService)
    private readonly aiService: AIService,
    @inject(PullRequestService)
    private readonly pullRequestService: PullRequestService,
    @inject(PullRequestCommentRepository)
    private readonly pullRequestCommentRepository: PullRequestCommentRepository,
    @inject(CodeReviewRepository)
    private readonly codeReviewRepository: CodeReviewRepository,
    @inject(LoggerService)
    private readonly loggerService: LoggerService,
  ) {}

  setGitProvider(gitProvider: Octokit): void {
    this.octokit = gitProvider;
    this.pullRequestService.setGitProvider(gitProvider);
  }

  async generatePullRequestSummary({
    repository,
    pullRequest,
  }: AIReviewParams): Promise<void> {
    const lastComment =
      await this.pullRequestCommentRepository.getPullRequestComment({
        pullRequestId: pullRequest.id,
        user: BOT_USER_REFERENCE,
        type: 'summary',
        userType: 'Bot',
      });

    // Check if a comment made by the bot already exists and is for the same commit
    if (lastComment && lastComment.commitId === pullRequest.headSha) {
      const message = `There are no changes since the last review, so there is no need to update the summary.\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`;

      await this.octokit.rest.issues.createComment({
        owner: repository.owner,
        repo: repository.name,
        issue_number: pullRequest.number,
        body: message,
      });

      return;
    }

    const { owner, name } = repository;
    const { number: pullNumber } = pullRequest;
    let context: PullRequestContext | undefined = undefined;

    try {
      context = await this.getPullRequestContext({
        repository,
        pullRequest,
        lastCommitReviewed: lastComment?.commitId,
        readAllCodeLines: false,
      });
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error getting pull request context',
      });
      return;
    }

    const summary = await this.summarizePullRequest({
      ...context,
      additionalContext: lastComment?.body
        ? `Last pull request summary generated (in the table only modify the summary of latest changed files): ${lastComment.body}`
        : '',
    });

    try {
      const commentOptions = {
        owner,
        repo: name,
        issue_number: pullNumber,
        body: summary,
      };

      if (!lastComment?.id) {
        const { data } =
          await this.octokit.rest.issues.createComment(commentOptions);
        const comment = PullRequestCommentMapper.mapPullRequestComment(data, {
          pullRequestId: pullRequest.id,
          commitId: pullRequest.headSha,
        }) as PullRequestComment;

        await this.pullRequestCommentRepository.savePullRequestComment({
          ...comment,
          type: 'summary',
        });
      } else {
        const { data } = await this.octokit.rest.issues.updateComment({
          ...commentOptions,
          comment_id: Number(lastComment.id),
        });
        await this.pullRequestCommentRepository.updatePullRequestComment(
          lastComment.id,
          {
            body: data.body,
            updatedAt: new Date(),
            commitId: pullRequest.headSha,
          },
        );
      }
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error creating AI summary',
      });
    }
  }

  async generatePullRequestReview({
    repository,
    pullRequest,
  }: AIReviewParams): Promise<void> {
    const lastCodeReview = await this.codeReviewRepository.getLastCodeReview({
      pullRequestId: pullRequest.id,
      reviewer: BOT_USER_REFERENCE,
      userType: 'Bot',
    });

    // Check if the code review already exists and is for the same commit
    // If it does, we don't need to generate a new one
    if (lastCodeReview && lastCodeReview.commitId === pullRequest.headSha) {
      const message = `Already reviewed this pull request.\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`;

      await this.octokit.rest.issues.createComment({
        owner: repository.owner,
        repo: repository.name,
        issue_number: pullRequest.number,
        body: message,
      });

      return;
    }

    const { owner, name } = repository;
    const { number: pullNumber } = pullRequest;
    let context: PullRequestContext | undefined = undefined;

    try {
      context = await this.getPullRequestContext({
        repository,
        pullRequest,
        lastCommitReviewed: lastCodeReview?.commitId,
        readAllCodeLines: false,
      });
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error getting pull request context',
      });
      return;
    }

    const { generalComment, comments } = await this.reviewPullRequest(context);

    try {
      await this.octokit.rest.pulls.createReview({
        owner,
        repo: name,
        pull_number: pullNumber,
        body: generalComment,
        event: 'COMMENT',
        comments,
      });
    } catch (error) {
      this.loggerService.logException(error, {
        message: 'Error creating AI review',
      });
    }
  }

  private async getPullRequestContext({
    repository,
    pullRequest,
    lastCommitReviewed,
  }: AIReviewContextParams): Promise<PullRequestContext> {
    const { owner, name } = repository;
    const { number: pullNumber, headSha } = pullRequest;
    let changedFiles:
      | Awaited<
          RestEndpointMethodTypes['pulls']['listFiles']['response']['data']
        >
      | undefined = undefined;

    if (!lastCommitReviewed) {
      const { data } = await this.octokit.rest.pulls.listFiles({
        owner,
        repo: name,
        pull_number: pullNumber,
      });

      changedFiles = data;
    } else {
      const {
        data: { files },
      } = await this.octokit.rest.repos.compareCommitsWithBasehead({
        owner,
        repo: name,
        base: lastCommitReviewed,
        head: headSha,
        basehead: `${lastCommitReviewed}...${headSha}`,
      });

      if (!files) {
        throw new Error('No files found in the pull request');
      }

      changedFiles = files;
    }

    const filteredChangedFiles = changedFiles.filter(({ filename }) =>
      isExtensionSupported(filename),
    );

    const context: PullRequestContext = {
      pullRequest,
      changedFiles: filteredChangedFiles,
    };

    return context;
  }

  private buildContextPrompt({
    pullRequest,
    changedFiles,
    fileContents,
  }: PullRequestContext): string {
    const prompt = `
      # Pull request context
      - Title: ${pullRequest.title}
      - Description: ${pullRequest.body || 'No description provided'}

      # Changed files
      ${changedFiles
        .map(({ filename, patch }) => {
          let fileDiff = `
          ## ${filename}
          ### Diff
          \`\`\`diff
          ${patch}
          \`\`\`
          `;

          if (fileContents) {
            fileDiff += `
            ### File content
            \`\`\`${getLanguageFromFilename(filename)}
            ${fileContents.get(filename)}
            \`\`\`
            `;
          }

          return fileDiff;
        })
        .join('\n')}
      `;

    return prompt;
  }

  private buildReviewPrompt({
    pullRequest,
    changedFiles,
  }: PullRequestContext): string {
    const prompt = `
      ${this.buildContextPrompt({
        pullRequest,
        changedFiles,
      })}

      # Instructions for the review

      Please review this pull request considering:
      1. Code quality and readability
      2. Possible bugs or security issues
      3. Compliance with best practices
      4. Suggestions for optimizations or improvements
      `;

    return prompt;
  }

  private async summarizePullRequest({
    pullRequest,
    changedFiles,
    additionalContext = '',
  }: PullRequestContext & {
    additionalContext?: string;
  }): Promise<string> {
    const prompt = this.buildContextPrompt({
      pullRequest,
      changedFiles,
    });
    const messages: PromptMessage[] = [{ role: 'user', content: prompt }];

    if (additionalContext) {
      messages.unshift({
        role: 'user',
        content: additionalContext,
      });
    }

    const response = await this.aiService.sendMessage({
      systemInstructions: this.summaryPrompt,
      messages,
    });

    const formattedResponse = `${response}\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`;

    return formattedResponse;
  }

  private async reviewPullRequest({
    pullRequest,
    changedFiles,
  }: PullRequestContext): Promise<AIPullRequestReview> {
    const prompt = this.buildReviewPrompt({
      pullRequest,
      changedFiles,
    });

    const completion = await this.aiService.sendMessage({
      systemInstructions: this.reviewPrompt,
      messages: [{ role: 'user', content: prompt }],
    });
    const { comments } = JSON.parse(completion) as {
      comments: AIPullRequestReview['comments'];
    };
    const response: AIPullRequestReview = {
      generalComment: comments.length
        ? `## Review\n\n ${comments.length} comments.\n\n---\n\nCommit reviewed: ${pullRequest.headSha}`
        : `## Review\n\n No relevant changes detected.\n\n---\n\nCommit reviewed: ${pullRequest.headSha}`,
      comments,
    };

    return response;
  }
}
