import { prisma } from 'src/database/db-connection';
import {
  PullRequestNode,
  PullRequestsByRepositoryNode,
} from '../interfaces/pull-requests-by-repository-node';
import { PullRequest } from '@prisma/client';
import { saveCodeReviewHistoryByPullRequest } from './code-review.service';
import { Octokit } from 'octokit';

const getPullRequestsByRepository = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  after?: string,
): Promise<PullRequestsByRepositoryNode> => {
  const query = `
    query ($owner: String!, $name: String!, $after: String) {
      repository(owner: $owner, name: $name) {
        id
        pullRequests(
          first: 100,
          after: $after,
          states: [CLOSED, MERGED],
          orderBy: { field: CREATED_AT, direction: ASC }
        ) {
          nodes {
            id
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

  const variables = { owner, name: repo, after };
  const result = await octokit.graphql<PullRequestsByRepositoryNode>(
    query,
    variables,
  );

  return result;
};

const filterPullRequestsFromLastYear = () => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return ({ createdAt }: PullRequestNode) => new Date(createdAt) >= oneYearAgo;
};

const getPullRequestHistory = async (
  octokit: Octokit,
  owner: string,
  repo: string,
  filter?: (node: PullRequestNode) => boolean,
) => {
  let allPullRequests: PullRequest[] = [];
  let hasNextPage = true;
  let cursor: string | undefined;
  const filterFunction = filter || filterPullRequestsFromLastYear();

  while (hasNextPage) {
    const { repository } = await getPullRequestsByRepository(
      octokit,
      owner,
      repo,
      cursor,
    );
    const { pullRequests } = repository;
    const recentPullRequests = pullRequests.nodes.filter(filterFunction);
    const pullRequestsMapped = recentPullRequests.map(
      ({
        id,
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
          id,
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
          repositoryId: repository.id,
        }) as PullRequest,
    );
    allPullRequests = allPullRequests.concat(pullRequestsMapped);
    hasNextPage = pullRequests.pageInfo.hasNextPage;
    cursor = pullRequests.pageInfo.endCursor;
  }

  return allPullRequests;
};

export const savePullRequestsHistoryByRepository = async (
  octokit: Octokit,
  owner: string,
  repo: string,
) => {
  const pullRequests = await getPullRequestHistory(octokit, owner, repo);

  await prisma.pullRequest.createMany({
    data: pullRequests,
  });

  const codeReviewsPromises = pullRequests.map(({ id, number }) => {
    return saveCodeReviewHistoryByPullRequest(owner, repo, number, id, octokit);
  });

  await Promise.all(codeReviewsPromises);
};
