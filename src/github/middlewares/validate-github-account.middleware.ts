/* eslint-disable no-case-declarations */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { container } from 'src/app/config/container-config';
import { envConfig } from 'src/app/config/env-config';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';
import { EventTypeMap } from 'src/github/factories/event-handler-factory';

const loggerService = container.get(LoggerService);

const isAccountAuthorized = async (accountName: string): Promise<boolean> => {
  const testAccountRepository = container.get(TestAccountRepository);
  try {
    const account =
      await testAccountRepository.findTestAccountByName(accountName);
    return !!account;
  } catch (error) {
    loggerService.logException(error, {
      message: `Error validating account ${accountName}`,
    });
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
    const eventType = req.headers['x-github-event'] as keyof EventTypeMap;
    let accountName: string | null = null;

    switch (eventType) {
      case 'installation':
        const installationPayload =
          req.body as EventTypeMap[typeof eventType]['payload'];
        accountName =
          installationPayload.installation.account?.name ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (installationPayload.installation.account as any).login ||
          null;
        break;
      case 'installation_repositories':
        const installationRepositoriesPayload =
          req.body as EventTypeMap[typeof eventType]['payload'];
        accountName =
          installationRepositoriesPayload.installation.account?.name ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (installationRepositoriesPayload.installation.account as any).login ||
          null;
        break;
      case 'repository':
        accountName = (req.body as EventTypeMap[typeof eventType]['payload'])
          .repository.owner.login;
        break;
      case 'pull_request':
        accountName = (req.body as EventTypeMap[typeof eventType]['payload'])
          .repository.owner.login;
        break;
      case 'issue_comment':
        accountName = (req.body as EventTypeMap[typeof eventType]['payload'])
          .repository.owner.login;
        break;
      case 'pull_request_review':
        accountName = (req.body as EventTypeMap[typeof eventType]['payload'])
          .repository.owner.login;
        break;
      case 'pull_request_review_comment':
        accountName = (req.body as EventTypeMap[typeof eventType]['payload'])
          .repository.owner.login;
        break;
      case 'pull_request_review_thread':
        accountName = (req.body as EventTypeMap[typeof eventType]['payload'])
          .repository.owner.login;
        break;
    }

    if (!accountName) {
      loggerService.error('The account could not be identified', {
        eventType,
      });
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'Account not identified',
      });
    }

    const isAuthorized = await isAccountAuthorized(accountName);

    if (!isAuthorized) {
      loggerService.error(
        `The account has not permissions to use this app: ${accountName}`,
        {
          eventType,
        },
      );
      return res.status(StatusCodes.FORBIDDEN).json({
        message: 'The account does not have permissions to use this app',
      });
    }

    next();
  } catch (error) {
    loggerService.logException(error, {
      message: 'Error when validating account',
    });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error when validating account',
    });
  }
};
