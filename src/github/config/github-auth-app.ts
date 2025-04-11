import { OAuthApp } from '@octokit/oauth-app';
import { envConfig } from 'src/app/config/env-config';

export const gitHubAuthApp = new OAuthApp({
  clientType: 'github-app',
  clientId: envConfig.GITHUB_CLIENT_ID,
  clientSecret: envConfig.GITHUB_CLIENT_SECRET,
});
