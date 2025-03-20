import { injectable } from 'inversify';
import { AIReviewContextParams } from 'src/core/interfaces/review-params';

@injectable()
export abstract class AIReviewService {
  abstract setGitProvider(gitProvider: unknown): void;
  abstract generatePullRequestSummary({
    repository,
    pullRequest,
    readAllFiles,
    readAllCodeLines,
  }: AIReviewContextParams): Promise<void>;
  abstract generatePullRequestReview({
    repository,
    pullRequest,
  }: AIReviewContextParams): Promise<void>;
}
