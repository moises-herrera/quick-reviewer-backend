import { prisma } from 'src/database/db-connection';
import { CodeReview } from '@prisma/client';
import { mapCodeReviewToCreation } from '../mappers/code-review.mapper';
import { CodeReviewData } from '../interfaces/code-review-data';
import { Octokit } from '../github-app';
import { CodeReviewAttributes } from '../interfaces/code-review-attributes';

export class CodeReviewHistoryService {
  constructor(private readonly octokit: Octokit) {}

  async saveCodeReviewHistoryByPullRequest(
    attributes: CodeReviewAttributes,
  ): Promise<void> {
    const codeReviews =
      await this.getCodeReviewHistoryByPullRequest(attributes);

    await prisma.codeReview.createMany({
      data: codeReviews,
    });
  }

  private async getCodeReviewHistoryByPullRequest({
    owner,
    name,
    pullRequestNumber,
    pullRequestId,
  }: CodeReviewAttributes): Promise<CodeReview[]> {
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
