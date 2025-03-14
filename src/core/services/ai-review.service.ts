import { injectable } from 'inversify';
import { AIReviewParams } from 'src/core/interfaces/review-params';

@injectable()
export abstract class AIReviewService {
  abstract setGitProvider(gitProvider: unknown): void;
  abstract generatePullRequestSummary({
    repository,
    pullRequest,
    fullReview,
    includeFileContents,
  }: AIReviewParams): Promise<void>;
  abstract generatePullRequestReview({
    repository,
    pullRequest,
  }: AIReviewParams): Promise<void>;
}
