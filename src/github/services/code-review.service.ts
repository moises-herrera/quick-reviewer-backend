import { prisma } from 'src/database/db-connection';
import { CodeReview } from '@prisma/client';
import { mapCodeReviewToCreation } from '../mappers/code-review.mapper';
import { CodeReviewData } from '../interfaces/code-review-data';
import { Octokit } from 'octokit';

const getCodeReviewHistoryByPullRequest = async (
  owner: string,
  repo: string,
  pullRequestNumber: number,
  pullRequestId: string,
  octokit: Octokit,
): Promise<CodeReview[]> => {
  const { data } = await octokit.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: pullRequestNumber,
    per_page: 100,
    page: 1,
  });
  const codeReviewsMapped = data.map(
    (data: CodeReviewData) =>
      <CodeReview>{
        ...mapCodeReviewToCreation(data as CodeReviewData),
        pullRequestId,
      },
  );

  return codeReviewsMapped;
};

export const saveCodeReviewHistoryByPullRequest = async (
  owner: string,
  repo: string,
  pullRequestNumber: number,
  pullRequestId: string,
  octokit: Octokit,
) => {
  const codeReviews = await getCodeReviewHistoryByPullRequest(
    owner,
    repo,
    pullRequestNumber,
    pullRequestId,
    octokit,
  );

  await prisma.codeReview.createMany({
    data: codeReviews,
  });
};
