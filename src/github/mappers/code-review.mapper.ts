import { CodeReview } from '@prisma/client';
import { CodeReviewData } from 'src/github/interfaces/code-review-data';

export class CodeReviewMapper {
  static mapCodeReviewToCreation(data: CodeReviewData): CodeReview {
    return {
      id: data.id.toString(),
      reviewer: data.user.login,
      body: data.body,
      status: data.state.toUpperCase(),
      createdAt: new Date(data.submitted_at),
      userType: data.user.type,
      commitId: data.commit_id,
    } as CodeReview;
  }
}
