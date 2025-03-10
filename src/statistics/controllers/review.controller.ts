import { NextFunction, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { ReviewService } from '../services/review.service';
import { PullRequestAverageCompletionTime } from '../schemas/pull-request-average-completion-time.schema';

export class ReviewController {
  private readonly reviewService = new ReviewService();

  async getPullRequestReviews(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const options = parsePaginationOptions(req.query);
      const response = await this.reviewService.getPullRequestReviews({
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
