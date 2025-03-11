import { NextFunction, Response } from 'express';
import { AccountService } from '../../github/services/account.service';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthRequest } from 'src/common/interfaces/auth-request';

export class AccountController {
  private readonly accountService = new AccountService();

  async getAllAccounts(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountService.getAccounts({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getOrganizations(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountService.getOrganizations({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountService.getUsers({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }
}
