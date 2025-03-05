import { Response } from 'express';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { handleHttpExceptionMiddleware } from 'src/common/middlewares/handle-http-exception.middleware';
import { RepositoryService } from '../services/repository.service';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';

export class RepositoryController {
  private readonly repositoryService = new RepositoryService();

  async getRepositories(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const ownerId = Number(req.params.ownerId);
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.repositoryService.getRepositories({
        ...paginationOptions,
        userId,
        ownerId,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      handleHttpExceptionMiddleware(error, req, res);
    }
  }
}
