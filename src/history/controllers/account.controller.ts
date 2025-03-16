import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { inject } from 'inversify';
import { AccountRepository } from 'src/core/repositories/account.repository';

export class AccountController {
  constructor(
    @inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  getAllAccounts: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountRepository.getAccounts({
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
      const response = await this.accountRepository.getOrganizations({
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
      const response = await this.accountRepository.getUsers({
        ...paginationOptions,
        userId,
      });
      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
