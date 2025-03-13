import { RestEndpointMethodTypes } from '@octokit/rest';
import { Octokit } from '../interfaces/octokit';

export class PullRequestService {
  async getFileContents(
    octokit: Octokit,
    owner: string,
    repo: string,
    changedFiles: RestEndpointMethodTypes['pulls']['listFiles']['response']['data'],
    headSha: string,
  ): Promise<{
    fileContents: Map<string, string>;
  }> {
    const fileContents = new Map<string, string>();

    for (const file of changedFiles) {
      try {
        if (!['removed', 'renamed', 'unchanged'].includes(file.status)) {
          const response = await octokit.rest.repos.getContent({
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
        console.error('Error fetching file content:', error);
      }
    }

    return {
      fileContents,
    };
  }
}
