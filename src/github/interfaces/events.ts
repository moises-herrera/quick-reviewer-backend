import { EmitterWebhookEvent } from '@octokit/webhooks';
import { GitHubWebHookEvent } from './github-webhook-event';

export type InstallationRepositoriesEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'installation_repositories'>['payload']
>;

export type InstallationEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'installation'>['payload']
>;

export type IssueCommentEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'issue_comment'>['payload']
>;

export type PullRequestReviewCommentEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'pull_request_review_comment'>['payload']
>;

export type PullRequestReviewThreadEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'pull_request_review_thread'>['payload']
>;

export type PullRequestReviewEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'pull_request_review'>['payload']
>;

export type PullRequestEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'pull_request'>['payload']
>;

export type RepositoryEvent = GitHubWebHookEvent<
  EmitterWebhookEvent<'repository'>['payload']
>;
