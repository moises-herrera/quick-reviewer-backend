import { Repository } from '@prisma/client';
import { Octokit } from '../../github/interfaces/octokit';
import { PullRequestHistoryService } from './pull-request-history.service';

export class HistoryService {
  private readonly pullRequestHistoryService = new PullRequestHistoryService(
    this.octokit,
  );

  constructor(private readonly octokit: Octokit) {}

  async recordHistory(
    owner: string,
    repositories: Repository[],
  ): Promise<void> {
    const pullRequestsPromises = repositories.map(({ name }) => {
      return this.pullRequestHistoryService.savePullRequestsHistoryByRepository(
        {
          owner,
          name,
        },
      );
    });

    await Promise.all(pullRequestsPromises);
  }
}
