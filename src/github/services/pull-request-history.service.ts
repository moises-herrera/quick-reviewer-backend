import { prisma } from 'src/database/db-connection';
import { PullRequest } from '@prisma/client';
import { CodeReviewHistoryService } from './code-review-history.service';
import { Octokit } from '../github-app';
import { RepositoryAttributes } from '../interfaces/repository-attributes';
import { PullRequestFilters } from '../interfaces/pull-request-filters';

export class PullRequestHistoryService {
  private readonly codeReviewHistoryService = new CodeReviewHistoryService(
    this.octokit,
  );

  constructor(private readonly octokit: Octokit) {}

  async savePullRequestsHistoryByRepository({
    owner,
    name,
  }: RepositoryAttributes) {
    const pullRequests = await this.getPullRequestHistory({ owner, name });

    await prisma.pullRequest.createMany({
      data: pullRequests,
    });

    const codeReviewsPromises = pullRequests.map(({ id, number }) => {
      return this.codeReviewHistoryService.saveCodeReviewHistoryByPullRequest({
        owner,
        name,
        pullRequestNumber: number,
        pullRequestId: id as unknown as bigint,
      });
    });

    await Promise.all(codeReviewsPromises);
  }

  private async getPullRequestsByRepository(
    { owner, name }: RepositoryAttributes,
    filters?: PullRequestFilters,
  ) {
    const defaultStartDate = '2024-01-01';
    const defaultEndDate = '2024-12-31';
    const result = await this.octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${name} is:pr is:merged created:${filters?.startDate || defaultStartDate}..${filters?.endDate || defaultEndDate}`,
      per_page: filters?.perPage || 100,
      page: filters?.page || 1,
      sort: 'created',
      order: 'desc',
    });

    return result;
  }

  private async getPullRequestHistory(
    { owner, name }: RepositoryAttributes,
    filters?: PullRequestFilters,
  ) {
    let pullRequestNumbers: number[] = [];
    let hasNextPage = true;
    let page = 1;

    while (hasNextPage) {
      const result = await this.getPullRequestsByRepository(
        { owner, name },
        {
          ...filters,
          page,
        },
      );
      pullRequestNumbers = pullRequestNumbers.concat(
        result.data.items.map(({ number }) => number),
      );
      hasNextPage = result.data.total_count > pullRequestNumbers.length;
      page++;
    }

    const pullRequestsPromises = pullRequestNumbers.map(async (number) => {
      const {
        data: {
          id,
          node_id: nodeId,
          title,
          state,
          url,
          additions,
          deletions,
          changed_files: changedFiles,
          user,
          created_at: createdAt,
          updated_at: updatedAt,
          closed_at: closedAt,
          merged_at: mergedAt,
          base: {
            repo: { id: repositoryId },
            sha: baseSha,
          },
          head: { sha: headSha },
        },
      } = await this.octokit.rest.pulls.get({
        owner,
        repo: name,
        pull_number: number,
      });

      return {
        id: id as unknown as bigint,
        nodeId,
        number,
        title,
        state,
        url,
        additions,
        deletions,
        changedFiles,
        author: user.login,
        createdAt: new Date(createdAt),
        updatedAt: new Date(updatedAt),
        closedAt: closedAt ? new Date(closedAt) : null,
        mergedAt: mergedAt ? new Date(mergedAt) : null,
        repositoryId: repositoryId as unknown as bigint,
        baseSha,
        headSha,
      } as PullRequest;
    });

    return Promise.all(pullRequestsPromises);
  }
}
