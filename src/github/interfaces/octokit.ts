import { gitHubApp } from '../config/github-app';

export type Octokit = typeof gitHubApp.octokit;
