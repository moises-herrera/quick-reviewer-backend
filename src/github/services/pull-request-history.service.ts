import { prisma } from 'src/database/db-connection';
import {
  PullRequestNode,
  PullRequestsByRepositoryNode,
} from '../interfaces/pull-requests-by-repository-node';
import { PullRequest } from '@prisma/client';
import { CodeReviewHistoryService } from './code-review-history.service';
import { Octokit } from 'octokit';
import { RepositoryAttributes } from '../interfaces/repository-attributes';

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
    after?: string,
  ): Promise<PullRequestsByRepositoryNode> {
    const query = `
      query ($owner: String!, $name: String!, $after: String) {
        repository(owner: $owner, name: $name) {
          databaseId
          pullRequests(
            first: 100,
            after: $after,
            states: [MERGED],
            orderBy: { field: CREATED_AT, direction: DESC }
          ) {
            nodes {
              databaseId
              number
              title
              state
              url
              author {
                login
              }
              createdAt
              updatedAt
              closedAt
              additions
              deletions
              changedFiles
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    const variables = { owner, name, after };
    const result = await this.octokit.graphql<PullRequestsByRepositoryNode>(
      query,
      variables,
    );

    return result;
  }

  private filterPullRequestsFromLastYear = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return ({ createdAt }: PullRequestNode) =>
      new Date(createdAt) >= oneYearAgo;
  };

  private async getPullRequestHistory(
    { owner, name }: RepositoryAttributes,
    filter?: (node: PullRequestNode) => boolean,
  ) {
    let allPullRequests: PullRequest[] = [];
    let hasNextPage = true;
    let cursor: string | undefined;
    const filterFunction = filter || this.filterPullRequestsFromLastYear();

    while (hasNextPage) {
      const { repository } = await this.getPullRequestsByRepository(
        { owner, name },
        cursor,
      );
      const { pullRequests } = repository;
      const recentPullRequests = pullRequests.nodes.filter(filterFunction);
      const pullRequestsMapped = recentPullRequests.map(
        ({
          databaseId: id,
          number,
          title,
          state,
          url,
          author,
          createdAt,
          updatedAt,
          closedAt,
          additions,
          deletions,
          changedFiles,
        }) =>
          ({
            id: id as unknown as bigint,
            number,
            title,
            state,
            url,
            additions,
            deletions,
            changedFiles,
            author: author.login,
            createdAt: new Date(createdAt),
            updatedAt: new Date(updatedAt),
            closedAt: closedAt ? new Date(closedAt) : null,
            repositoryId: repository.databaseId as unknown as bigint,
          }) as PullRequest,
      );
      allPullRequests = allPullRequests.concat(pullRequestsMapped);
      hasNextPage = pullRequests.pageInfo.hasNextPage;
      cursor = pullRequests.pageInfo.endCursor;
    }

    return allPullRequests;
  }
}
