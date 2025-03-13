import { Octokit } from '../interfaces/octokit';

export interface GitHubWebHookEvent<T> {
  octokit?: Octokit;
  payload: T;
}
