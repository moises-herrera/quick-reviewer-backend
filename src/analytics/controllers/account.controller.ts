import { Response } from 'express';
import { AccountService } from '../services/account.service';
import { handleHttpExceptionMiddleware } from 'src/common/middlewares/handle-http-exception.middleware';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthRequest } from 'src/common/interfaces/auth-request';

export class AccountController {
  private readonly accountService = new AccountService();

  async getOrganizations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountService.getOrganizations({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      handleHttpExceptionMiddleware(error, req, res);
    }
  }

  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountService.getUsers({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      handleHttpExceptionMiddleware(error, req, res);
    }
  }
}
