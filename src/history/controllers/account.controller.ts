import { AccountRepository } from '../../github/repositories/account.repository';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export class AccountController {
  private readonly accountService = new AccountRepository();

  getAllAccounts: AuthHttpHandler = async (req, res, next): Promise<void> => {
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
  };

  getOrganizations: AuthHttpHandler = async (req, res, next): Promise<void> => {
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
  };

  getUsers: AuthHttpHandler = async (req, res, next): Promise<void> => {
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
  };
}
