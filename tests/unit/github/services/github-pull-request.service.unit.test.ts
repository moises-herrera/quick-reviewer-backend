import { Octokit } from '@octokit/rest';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { PullRequestFile } from 'src/github/interfaces/pull-request-file';
import { GitHubPullRequestService } from 'src/github/services/github-pull-request.service';
import { MockLoggerService } from 'tests/mocks/mock-logger.service';

describe('GitHubPullRequestService', () => {
  let service: GitHubPullRequestService;
  let octokit: Octokit;
  let loggerService: LoggerService;

  beforeEach(() => {
    octokit = {
      rest: {
        repos: {
          getContent: vi.fn(),
        },
      },
    } as unknown as Octokit;
    loggerService = new MockLoggerService();
    service = new GitHubPullRequestService(loggerService);
    service.setGitProvider(octokit);
  });

  describe('getFilesContent', () => {
    it('should fetch file content for changed files', async () => {
      const owner = 'owner';
      const repo = 'repo';
      const changedFiles: PullRequestFile[] = [
        { filename: 'file1.js', status: 'modified' },
        { filename: 'file2.js', status: 'added' },
        { filename: 'file3.js', status: 'unchanged' },
      ];
      const headSha = '5875';

      const spyGetContent = vi
        .spyOn(octokit.rest.repos, 'getContent')
        .mockResolvedValue({
          data: {
            content: Buffer.from('file content').toString('base64'),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

      const result = await service.getFilesContent(
        owner,
        repo,
        changedFiles,
        headSha,
      );

      expect(spyGetContent).toHaveBeenCalledTimes(2);
      expect(spyGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: 'file1.js',
        ref: headSha,
      });
      expect(spyGetContent).toHaveBeenCalledWith({
        owner,
        repo,
        path: 'file2.js',
        ref: headSha,
      });
      expect(result.fileContents.size).toBe(2);
      expect(result.fileContents.get('file1.js')).toBe('file content');
      expect(result.fileContents.get('file2.js')).toBe('file content');
    });

    it('should throw an error if fetching file content fails', async () => {
      const owner = 'owner';
      const repo = 'repo';
      const changedFiles: PullRequestFile[] = [
        { filename: 'file1.js', status: 'modified' },
      ];
      const headSha = '5875';

      vi.spyOn(octokit.rest.repos, 'getContent').mockRejectedValue(
        new Error('Error'),
      );
      const spyError = vi
        .spyOn(loggerService, 'error')
        .mockImplementation(() => {});

      await service.getFilesContent(owner, repo, changedFiles, headSha);
      expect(spyError).toHaveBeenCalled();
    });
  });
});
