import { Octokit } from '../github-app';

export interface GitHubWebHookEvent<T> {
  octokit?: Octokit;
  payload: T;
}
