import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { inject } from 'inversify';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';

export class AccountController {
  constructor(
    @inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
  ) {}

  getAllAccounts: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as string;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.accountRepository.getPaginatedAccounts({
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
      const userId = req.userId as string;
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
      const userId = req.userId as string;
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
