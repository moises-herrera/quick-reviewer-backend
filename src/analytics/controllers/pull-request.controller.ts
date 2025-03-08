import { Response } from 'express';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { handleHttpExceptionMiddleware } from 'src/common/middlewares/handle-http-exception.middleware';
import { PullRequestService } from '../services/pull-request.service';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';

export class PullRequestController {
  private readonly pullRequestService = new PullRequestService();

  async getPullRequests(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const repositoryId = Number(req.params.repositoryId);
      const options = parsePaginationOptions(req.query);
      const response = await this.pullRequestService.getPullRequests({
        ...options,
        userId,
        repositoryId,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      handleHttpExceptionMiddleware(error, req, res);
    }
  }

  async getPullRequestReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const repositoryId = Number(req.params.repositoryId);
      const pullRequestId = Number(req.params.pullRequestId);
      const options = parsePaginationOptions(req.query);
      const response = await this.pullRequestService.getPullRequestReviews({
        ...options,
        userId,
        repositoryId,
        pullRequestId,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      handleHttpExceptionMiddleware(error, req, res);
    }
  }
}
