import {
  getLanguageFromFilename,
  isExtensionSupported,
} from 'src/common/utils/get-language-from-filename';
import { PullRequestContext } from '../interfaces/pull-request-context';
import { AIService } from 'src/ai/services/ai.service';
import { Octokit } from '../github-app';
import { PullRequestService } from './pull-request.service';
import { ReviewParams } from '../interfaces/review-params';
import { AIReviewComment } from '../interfaces/ai-review-comment';

export class AIReviewService {
  private readonly pullRequestService = new PullRequestService();
  private readonly aiService = new AIService();

  async generatePullRequestReview(
    octokit: Octokit,
    { repository, pullRequest, includeFileComments = false }: ReviewParams,
  ): Promise<void> {
    const { owner, name } = repository;
    const { number: pullNumber, headSha } = pullRequest;
    const { changedFiles, fileContents } =
      await this.pullRequestService.getFileContents(
        octokit,
        owner,
        name,
        pullNumber,
        headSha as string,
      );

    const context: PullRequestContext = {
      pullRequest,
      changedFiles,
      fileContents,
    };
    const summary = await this.summaryPullRequest(context);
    let comments: AIReviewComment[] = [];

    if (includeFileComments) {
      const result = await this.reviewPullRequest(context);
      comments = result.comments;
    }

    try {
      await octokit.rest.pulls.createReview({
        owner,
        repo: name,
        pull_number: pullNumber,
        body: summary,
        event: 'COMMENT',
        comments,
      });
    } catch (error) {
      console.log('Error creating AI review:', error);
    }
  }

  async summaryPullRequest({
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
        You will also receive the full content of each file. Your task is to review the code and provide a summary of the changes in markdown syntax.
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
  }: PullRequestContext): Promise<{
    comments: AIReviewComment[];
  }> {
    const prompt = this.buildReviewPrompt({
      pullRequest,
      changedFiles,
      fileContents,
    });

    const completion = await this.aiService.sendMessage({
      systemInstructions: `
        You are an expert code reviewer. You will receive a pull request with a list of files and their diffs.
        You will also receive the full content of each file. Your task is to review the code and provide feedback.
        Generate review comments in markdown syntax if you find any issues.
        Output the review comments in a JSON format with the following structure:

        Example:
        '{"comments": [{"path": src/app/components/app.component.ts, "line": 10, "body": "This is a comment"}]}',
        'where "path" is the path of the file, "line" is the line number, and "body" is the comment.
        If you find no issues, return an empty array.

        Notes: 
        - The line number should be the first line of the diff.
        - Only answer with the JSON object.
        - Do not add any other text or explanation.
        `,
      messages: [{ role: 'user', content: prompt }],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (completion.content[0] as any).text;
    const parsedJson = JSON.parse(text);
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
        .filter((file) => isExtensionSupported(file.filename))
        .map(
          (file) => `
      ## ${file.filename}
      ### Diff
      \`\`\`diff
      ${file.patch}
      \`\`\`

      ### File content
      \`\`\`${getLanguageFromFilename(file.filename)}
      ${fileContents.get(file.filename)}
      \`\`\`
      `,
        )
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

      Please add a summary of the changes and review this pull request considering:
      1. Code quality and readability
      2. Possible bugs or security issues
      3. Compliance with best practices
      4. Suggestions for optimizations or improvements
      `;

    return prompt;
  }
}
