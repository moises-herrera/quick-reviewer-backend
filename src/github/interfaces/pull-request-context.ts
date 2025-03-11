import { RestEndpointMethodTypes } from '@octokit/rest';
import { PullRequest } from '@prisma/client';

export interface PullRequestContext {
  pullRequest: PullRequest;
  changedFiles: RestEndpointMethodTypes['pulls']['listFiles']['response']['data'];
  fileContents: Map<string, string>;
}
