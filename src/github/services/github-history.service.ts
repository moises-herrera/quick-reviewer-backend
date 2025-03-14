import { CodeReview, PullRequest, Repository } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { CodeReviewAttributes } from 'src/core/interfaces/code-review-attributes';
import { CodeReviewData } from 'src/github/interfaces/code-review-data';
import { Octokit } from 'src/github/interfaces/octokit';
import { PullRequestFilters } from 'src/core/interfaces/pull-request-filters';
import { RepositoryAttributes } from 'src/core/interfaces/repository-attributes';
import { mapCodeReviewToCreation } from 'src/github/mappers/code-review.mapper';
import { CodeReviewRepository } from 'src/core/repositories/code-review.repository';
import { PullRequestRepository } from 'src/core/repositories/pull-request.repository';

@injectable()
export class GitHubHistoryService {
  private octokit?: Octokit;

  constructor(
    @inject(PullRequestRepository)
    private readonly pullRequestRepository: PullRequestRepository,
    @inject(CodeReviewRepository)
    private readonly codeReviewRepository: CodeReviewRepository,
  ) {}

  setOctokit(octokit: Octokit) {
    this.octokit = octokit;
  }

  async recordHistory(
    owner: string,
    repositories: Repository[],
  ): Promise<void> {
    if (!this.octokit) {
      throw new Error('Octokit instance is not set.');
    }

    const pullRequestsPromises = repositories.map(({ name }) => {
      return this.savePullRequestsHistoryByRepository({
        owner,
        name,
      });
    });

    await Promise.all(pullRequestsPromises);
  }

  async savePullRequestsHistoryByRepository({
    owner,
    name,
  }: RepositoryAttributes) {
    const pullRequests = await this.getPullRequestHistory({ owner, name });

    await this.pullRequestRepository.savePullRequests(pullRequests);

    const codeReviewsPromises = pullRequests.map(({ id, number }) => {
      return this.saveCodeReviewHistoryByPullRequest({
        owner,
        name,
        pullRequestNumber: number,
        pullRequestId: id as unknown as bigint,
      });
    });

    await Promise.all(codeReviewsPromises);
  }

  async saveCodeReviewHistoryByPullRequest(
    attributes: CodeReviewAttributes,
  ): Promise<void> {
    const codeReviews =
      await this.getCodeReviewHistoryByPullRequest(attributes);

    await this.codeReviewRepository.saveCodeReviews(codeReviews);
  }

  private async getPullRequestsByRepository(
    { owner, name }: RepositoryAttributes,
    filters?: PullRequestFilters,
  ) {
    if (!this.octokit) {
      throw new Error('Octokit instance is not set.');
    }

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
    if (!this.octokit) {
      throw new Error('Octokit instance is not set.');
    }

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
      } = await this.octokit!.rest.pulls.get({
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

  private async getCodeReviewHistoryByPullRequest({
    owner,
    name,
    pullRequestNumber,
    pullRequestId,
  }: CodeReviewAttributes): Promise<CodeReview[]> {
    if (!this.octokit) {
      throw new Error('Octokit instance is not set.');
    }

    const { data } = await this.octokit.rest.pulls.listReviews({
      owner,
      repo: name,
      pull_number: pullRequestNumber,
      per_page: 100,
      page: 1,
    });
    const codeReviewsMapped = data.map(
      (data) =>
        <CodeReview>{
          ...mapCodeReviewToCreation(data as CodeReviewData),
          pullRequestId,
        },
    );

    return codeReviewsMapped;
  }
}
