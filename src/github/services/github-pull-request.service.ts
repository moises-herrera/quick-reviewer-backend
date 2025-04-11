import { isExtensionSupported } from 'src/common/utils/language-support';
import { inject, injectable } from 'inversify';
import { PullRequestFile } from 'src/github/interfaces/pull-request-file';
import { Octokit } from '@octokit/rest';
import { PullRequestService } from 'src/github/abstracts/pull-request.abstract';
import { LoggerService } from 'src/common/abstracts/logger.abstract';

@injectable()
export class GitHubPullRequestService implements PullRequestService {
  private octokit: Octokit = {} as Octokit;

  private readonly omittedFileStatuses: string[] = [
    'removed',
    'renamed',
    'unchanged',
  ];

  constructor(
    @inject(LoggerService)
    private readonly loggerService: LoggerService,
  ) {}

  setGitProvider(gitProvider: Octokit) {
    this.octokit = gitProvider;
  }

  async getFilesContent(
    owner: string,
    repo: string,
    changedFiles: PullRequestFile[],
    headSha: string,
  ): Promise<{
    fileContents: Map<string, string>;
  }> {
    const fileContents = new Map<string, string>();

    for (const file of changedFiles) {
      try {
        if (
          !this.omittedFileStatuses.includes(file.status) &&
          isExtensionSupported(file.filename)
        ) {
          const response = await this.octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.filename,
            ref: headSha,
          });

          const content = Buffer.from(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (response.data as any).content,
            'base64',
          ).toString();
          fileContents.set(file.filename, content);
        }
      } catch (error) {
        this.loggerService.error('Error fetching file content:', { error });
      }
    }

    return {
      fileContents,
    };
  }
}
