import { injectable } from 'inversify';
import { AIReviewParams } from 'src/common/interfaces/review-params';

@injectable()
export abstract class AIReviewService {
  abstract setGitProvider(gitProvider: unknown): void;
  abstract generatePullRequestSummary(params: AIReviewParams): Promise<void>;
  abstract generatePullRequestReview(params: AIReviewParams): Promise<void>;
}
