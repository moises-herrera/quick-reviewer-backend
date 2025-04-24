import { injectable } from 'inversify';
import { PullRequestFile } from 'src/github/interfaces/pull-request-file';

@injectable()
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
