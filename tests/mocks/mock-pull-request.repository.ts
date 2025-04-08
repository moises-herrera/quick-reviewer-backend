import { PullRequest } from '@prisma/client';

export class MockPullRequestRepository {
  savePullRequest(data: PullRequest): Promise<PullRequest> {
    return Promise.resolve(data);
  }

  savePullRequests(data: PullRequest[]): Promise<void> {
    return Promise.resolve(undefined);
  }
}
