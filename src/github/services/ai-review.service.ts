import {
  getLanguageFromFilename,
  isExtensionSupported,
} from 'src/common/utils/language-support';
import { PullRequestContext } from '../interfaces/pull-request-context';
import { AIService } from 'src/ai/services/ai.service';
import { Octokit } from '../github-app';
import { PullRequestService } from './pull-request.service';
import { AIReviewParams } from '../interfaces/review-params';
import { AIPullRequestReview } from '../interfaces/ai-pull-request-review';
import { PullRequestComment } from '@prisma/client';
import { mapPullRequestComment } from '../mappers/pull-request-comment.mapper';
import { PullRequestCommentService } from './pull-request-comment.service';

export class AIReviewService {
  private readonly aiService = new AIService();
  private readonly pullRequestService = new PullRequestService();
  private readonly pullRequestCommentService = new PullRequestCommentService();

  private async getPullRequestContext(
    octokit: Octokit,
    { repository, pullRequest, includeFileContents = false }: AIReviewParams,
  ): Promise<PullRequestContext> {
    const { owner, name } = repository;
    const { number: pullNumber, headSha } = pullRequest;
    const { data: changedFiles } = await octokit.rest.pulls.listFiles({
      owner,
      repo: name,
      pull_number: pullNumber,
    });
    let fileContents: Map<string, string> | undefined = undefined;

    if (includeFileContents) {
      const result = await this.pullRequestService.getFileContents(
        octokit,
        owner,
        name,
        changedFiles,
        headSha,
      );

      fileContents = result.fileContents;
    }

    const context: PullRequestContext = {
      pullRequest,
      changedFiles,
      fileContents,
    };

    return context;
  }

  async generatePullRequestSummary(
    octokit: Octokit,
    { repository, pullRequest, includeFileContents = true }: AIReviewParams,
    commentId?: number,
  ): Promise<void> {
    const { owner, name } = repository;
    const { number: pullNumber } = pullRequest;
    const context = await this.getPullRequestContext(octokit, {
      repository,
      pullRequest,
      includeFileContents,
    });

    const summary = await this.summarizePullRequest(context);

    try {
      const commentOptions = {
        owner,
        repo: name,
        issue_number: pullNumber,
        body: summary,
      };

      if (!commentId) {
        const { data } =
          await octokit.rest.issues.createComment(commentOptions);
        const comment = mapPullRequestComment(data, {
          pullRequestId: pullRequest.id,
          commitId: pullRequest.headSha,
        }) as PullRequestComment;

        await this.pullRequestCommentService.savePullRequestComment({
          ...comment,
          type: 'summary',
        });
      } else {
        const { data } = await octokit.rest.issues.updateComment({
          ...commentOptions,
          comment_id: commentId,
        });
        const comment = mapPullRequestComment(data, {
          pullRequestId: pullRequest.id,
          commitId: pullRequest.headSha,
        }) as PullRequestComment;
        await this.pullRequestCommentService.updatePullRequestComment(
          commentId as unknown as bigint,
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
    { repository, pullRequest, includeFileContents = true }: AIReviewParams,
  ): Promise<void> {
    const { owner, name } = repository;
    const { number: pullNumber } = pullRequest;
    const context = await this.getPullRequestContext(octokit, {
      repository,
      pullRequest,
      includeFileContents,
    });

    const { generalComment } = await this.reviewPullRequest(context);

    try {
      await octokit.rest.pulls.createReview({
        owner,
        repo: name,
        pull_number: pullNumber,
        body: generalComment,
        event: 'COMMENT',
      });
    } catch (error) {
      console.log('Error creating AI review:', error);
    }
  }

  async summarizePullRequest({
    pullRequest,
    changedFiles,
    fileContents,
  }: PullRequestContext): Promise<string> {
    const prompt = this.buildContextPrompt({
      pullRequest,
      changedFiles,
      fileContents,
    });

    const completion = await this.aiService.sendMessage({
      systemInstructions: `
        You are an expert code reviewer. You will receive a pull request with a list of files and their diffs.
        If you receive the full content of each file, use it as context. Your task is to review the code and provide a summary of the changes in markdown syntax.
        Use the following format:
        ## Summary
        Provide a summary of the changes in the pull request, including the main points and any important details in a paragraph.
        ## Files Changed
        | File/Module | Change Summary |
        | ----------- | -------------- |
        | src/app/components/app.component.ts | Added a new component for the app header. |
        `,
      messages: [{ role: 'user', content: prompt }],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (completion.content[0] as any).text;
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
      systemInstructions: `
        You are an expert code reviewer. You will receive a pull request with a list of files and their diffs.
        In case you receive the full content of each file, use it as context. Your task is to review the code and provide feedback.
        Generate a short general comment and review comments in markdown syntax if you find any issues.
        Output the general comment and review comments in a JSON format with the following structure:

        Example:
        '{"generalComment": "Well-structured job configuration with appropriate security controls!", "comments": [{"path": src/app/components/app.component.ts, "line": 10, "position": 2, "body": "This is a comment"}]}',
        'where "path" is the path of the file, "line" is the line number, "body" is the comment, and 
        the position value equals the number of lines down from the first "@@" hunk header in the file you want to add a comment. 
        The line just below the "@@" line is position 1, the next line is position 2, and so on.

        If you find no issues, return a general comment and an empty array of comments.

        Notes: 
        - Only answer with the JSON object.
        - Do not add any other text or explanation.
        - IMPORTANT: You can count the line numbers from the diff hunk or the file content, but only the line numbers in the diff hunk are valid for comments.
        - Do not use the file content to generate comments, only use it for context.
        `,
      messages: [{ role: 'user', content: prompt }],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (completion.content[0] as any).text;
    const parsedJson = JSON.parse(text) as AIPullRequestReview;
    return parsedJson;
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
        .filter(({ filename }) => isExtensionSupported(filename))
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
