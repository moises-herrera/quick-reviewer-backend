import {
  getLanguageFromFilename,
  isExtensionSupported,
} from 'src/common/utils/language-support';
import { PullRequestContext } from '../interfaces/pull-request-context';
import { AIService } from 'src/ai/services/ai.service';
import { Octokit } from '../interfaces/octokit';
import { AIReviewParams } from '../interfaces/review-params';
import { AIPullRequestReview } from '../interfaces/ai-pull-request-review';
import { PullRequestComment } from '@prisma/client';
import { mapPullRequestComment } from '../mappers/pull-request-comment.mapper';
import { PullRequestCommentRepository } from '../../database/repositories/pull-request-comment.repository';
import { PullRequestService } from './pull-request.service';
import { BOT_USER_REFERENCE } from '../constants/bot';
import { CodeReviewRepository } from '../../database/repositories/code-review.repository';
import fs from 'node:fs';
import { PromptMessage } from 'src/ai/interfaces/message-config';
import { RestEndpointMethodTypes } from '@octokit/rest';
import { inject, injectable } from 'inversify';

@injectable()
export class AIReviewService {
  private readonly summaryPrompt = fs.readFileSync(
    'src/ai/prompts/pull-request-summary.md',
    'utf8',
  );

  private readonly reviewPrompt = fs.readFileSync(
    'src/ai/prompts/pull-request-review.md',
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
  ) {}

  private async getPullRequestContext(
    octokit: Octokit,
    {
      repository,
      pullRequest,
      fullReview = false,
      includeFileContents = false,
    }: AIReviewParams,
  ): Promise<PullRequestContext> {
    const { owner, name } = repository;
    const { number: pullNumber, headSha } = pullRequest;
    let changedFiles:
      | Awaited<
          RestEndpointMethodTypes['pulls']['listFiles']['response']['data']
        >
      | undefined = undefined;

    if (fullReview) {
      const { data } = await octokit.rest.pulls.listFiles({
        owner,
        repo: name,
        pull_number: pullNumber,
      });

      changedFiles = data;
    } else {
      const {
        data: { files },
      } = await octokit.rest.repos.getCommit({
        owner,
        repo: name,
        ref: headSha,
      });

      if (!files) {
        throw new Error('No files found in the pull request');
      }

      changedFiles = files;
    }

    const filteredChangedFiles = changedFiles.filter(({ filename }) =>
      isExtensionSupported(filename),
    );
    let fileContents: Map<string, string> | undefined = undefined;

    if (includeFileContents) {
      const result = await this.pullRequestService.getFileContents(
        octokit,
        owner,
        name,
        filteredChangedFiles,
        headSha,
      );

      fileContents = result.fileContents;
    }

    const context: PullRequestContext = {
      pullRequest,
      changedFiles: filteredChangedFiles,
      fileContents,
    };

    return context;
  }

  async generatePullRequestSummary(
    octokit: Octokit,
    {
      repository,
      pullRequest,
      fullReview = false,
      includeFileContents = true,
    }: AIReviewParams,
  ): Promise<void> {
    const lastComment =
      await this.pullRequestCommentRepository.getPullRequestComment(
        pullRequest.id,
        BOT_USER_REFERENCE,
        'summary',
      );

    // Check if a comment made by the bot already exists and is for the same commit
    if (
      lastComment &&
      lastComment.userType === 'Bot' &&
      lastComment.commitId === pullRequest.headSha
    ) {
      const message = `There are no changes since the last review, so there is no need to update the summary.\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`;

      await octokit.rest.issues.createComment({
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
      context = await this.getPullRequestContext(octokit, {
        repository,
        pullRequest,
        fullReview,
        includeFileContents,
      });
    } catch (error) {
      console.error('Error getting pull request context:', error);
      return;
    }

    const summary = await this.summarizePullRequest({
      ...context,
      additionalContext: lastComment?.body
        ? `Last pull request summary generated (check if it is necessary to update the summary): ${lastComment.body}`
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
          await octokit.rest.issues.createComment(commentOptions);
        const comment = mapPullRequestComment(data, {
          pullRequestId: pullRequest.id,
          commitId: pullRequest.headSha,
        }) as PullRequestComment;

        await this.pullRequestCommentRepository.savePullRequestComment({
          ...comment,
          type: 'summary',
        });
      } else {
        const { data } = await octokit.rest.issues.updateComment({
          ...commentOptions,
          comment_id: Number(lastComment.id),
        });
        const comment = mapPullRequestComment(data, {
          pullRequestId: pullRequest.id,
          commitId: pullRequest.headSha,
        }) as PullRequestComment;
        await this.pullRequestCommentRepository.updatePullRequestComment(
          lastComment.id,
          {
            body: comment.body,
            updatedAt: new Date(),
            commitId: pullRequest.headSha,
          },
        );
      }
    } catch (error) {
      console.log('Error creating AI summary:', error);
    }
  }

  async generatePullRequestReview(
    octokit: Octokit,
    { repository, pullRequest }: AIReviewParams,
  ): Promise<void> {
    const lastCodeReview = await this.codeReviewRepository.getCodeReview(
      pullRequest.id,
      pullRequest.headSha,
    );

    // Check if the code review already exists and is for the same commit
    // If it does, we don't need to generate a new one
    if (
      lastCodeReview &&
      lastCodeReview.reviewer === BOT_USER_REFERENCE &&
      lastCodeReview.userType === 'Bot' &&
      lastCodeReview?.commitId === pullRequest.headSha
    ) {
      const message = `Already reviewed this pull request.\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`;

      await octokit.rest.issues.createComment({
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
      context = await this.getPullRequestContext(octokit, {
        repository,
        pullRequest,
      });
    } catch (error) {
      console.error('Error getting pull request context:', error);
      return;
    }

    const { generalComment, comments } = await this.reviewPullRequest(context);

    try {
      await octokit.rest.pulls.createReview({
        owner,
        repo: name,
        pull_number: pullNumber,
        body: generalComment,
        event: 'COMMENT',
        comments,
      });
    } catch (error) {
      console.log('Error creating AI review:', error);
    }
  }

  async summarizePullRequest({
    pullRequest,
    changedFiles,
    fileContents,
    additionalContext = '',
  }: PullRequestContext & {
    additionalContext?: string;
  }): Promise<string> {
    const prompt = this.buildContextPrompt({
      pullRequest,
      changedFiles,
      fileContents,
    });
    const messages: PromptMessage[] = [{ role: 'user', content: prompt }];

    if (additionalContext) {
      messages.unshift({
        role: 'user',
        content: additionalContext,
      });
    }

    const completion = await this.aiService.sendMessage({
      systemInstructions: this.summaryPrompt,
      messages,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (completion.content[0] as any).text;
    const formattedResponse = `${response}\n\n---\n\nLast commit reviewed: ${pullRequest.headSha}`;

    return formattedResponse;
  }

  async reviewPullRequest({
    pullRequest,
    changedFiles,
    fileContents,
  }: PullRequestContext): Promise<AIPullRequestReview> {
    const prompt = this.buildReviewPrompt({
      pullRequest,
      changedFiles,
      fileContents,
    });

    const completion = await this.aiService.sendMessage({
      systemInstructions: this.reviewPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (completion.content[0] as any).text;
    const { comments } = JSON.parse(text) as {
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
    fileContents,
  }: PullRequestContext): string {
    const prompt = `
      ${this.buildContextPrompt({
        pullRequest,
        changedFiles,
        fileContents,
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
}
