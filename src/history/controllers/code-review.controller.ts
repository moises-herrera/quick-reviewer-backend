import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { CodeReviewService } from 'src/github/services/code-review.service';
import { PullRequestAverageCompletionTime } from 'src/statistics/schemas/pull-request-average-completion-time.schema';

export class CodeReviewController {
  private readonly codeReviewService = new CodeReviewService();

  async getCodeReviewsReviews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId as number;
      const { ownerName, repositoryName, pullRequestNumber } = req.params;
      const options = parsePaginationOptions(req.query);
      const response = await this.codeReviewService.getCodeReviews({
        ...options,
        userId,
        ownerName,
        repositoryName,
        pullRequestNumber: Number(pullRequestNumber),
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCodeReviewsDetailedInfo(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const options = parsePaginationOptions(req.query);
      const response = await this.codeReviewService.getCodeReviewsDetailedInfo({
        ...(req.body as PullRequestAverageCompletionTime),
        ...options,
        userId: req.userId as number,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
