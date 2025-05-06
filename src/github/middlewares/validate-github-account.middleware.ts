import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { container } from 'src/app/config/container-config';
import { envConfig } from 'src/app/config/env-config';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';

const isAccountAuthorized = async (accountName: string): Promise<boolean> => {
  const testAccountRepository = container.get(TestAccountRepository);
  try {
    const account =
      await testAccountRepository.findTestAccountByName(accountName);
    return !!account;
  } catch (error) {
    console.error(`Error validating account ${accountName}:`, error);
    return false;
  }
};
export const validateGitHubAccountMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.path !== envConfig.GITHUB_WEBHOOK_PATH) {
    return next();
  }

  try {
    const payload = req.body;
    let accountName: string | null = null;

    if (payload.installation && payload.installation.account.login) {
      accountName = payload.installation.account.login;
    } else if (payload.repository && payload.repository.owner.login) {
      accountName = payload.repository.owner.login;
    }

    if (!accountName) {
      console.warn(
        'The account could not be identified:',
        req.headers['x-github-event'],
      );
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Account not identified',
      });
    }

    const isAuthorized = await isAccountAuthorized(accountName);

    if (!isAuthorized) {
      console.warn(
        `The account has not permissions to use this app: ${accountName}`,
      );
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'The account does not have permissions to use this app',
      });
    }

    next();
  } catch (error) {
    console.error('Error when validating account:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error when validating account',
    });
  }
};
