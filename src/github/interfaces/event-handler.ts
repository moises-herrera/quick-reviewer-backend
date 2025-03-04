import { Octokit } from '../github-app';
import { GitHubWebHookEvent } from './github-webhook-event';

export abstract class EventHandler<T> {
  protected readonly octokit?: Octokit;
  protected readonly payload: T;

  constructor({ octokit, payload }: GitHubWebHookEvent<T>) {
    this.octokit = octokit;
    this.payload = payload;
  }

  abstract handle(): Promise<void>;
}
