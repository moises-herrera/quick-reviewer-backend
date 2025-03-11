import { NextFunction, Response } from 'express';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { PullRequestService } from '../../github/services/pull-request.service';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';

export class PullRequestController {
  private readonly pullRequestService = new PullRequestService();

  async getPullRequests(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId as number;
      const { ownerName, repositoryName } = req.params;
      const options = parsePaginationOptions(req.query);
      const response = await this.pullRequestService.getPullRequests({
        ...options,
        userId,
        ownerName,
        repositoryName,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
