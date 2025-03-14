import { PullRequestFile } from 'src/core/interfaces/pull-request-file';

export abstract class PullRequestService {
  abstract setGitProvider(gitProvider: unknown): void;
  abstract getFilesContent(
    owner: string,
    repo: string,
    changedFiles: PullRequestFile[],
    headSha: string,
  ): Promise<{
    fileContents: Map<string, string>;
  }>;
}
