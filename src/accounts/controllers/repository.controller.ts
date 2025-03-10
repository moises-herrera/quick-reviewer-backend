import { NextFunction, Response } from 'express';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { RepositoryService } from '../services/repository.service';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';

export class RepositoryController {
  private readonly repositoryService = new RepositoryService();

  async getRepositories(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId as number;
      const ownerName = req.params.ownerName;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.repositoryService.getRepositories({
        ...paginationOptions,
        userId,
        ownerName,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
