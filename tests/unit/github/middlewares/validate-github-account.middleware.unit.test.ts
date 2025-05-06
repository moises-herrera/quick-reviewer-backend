import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { envConfig } from 'src/app/config/env-config';
import { validateGitHubAccountMiddleware } from 'src/github/middlewares/validate-github-account.middleware';

const testAccountRepository = vi.hoisted(() => ({
  findTestAccountByName: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: () => testAccountRepository,
  },
}));

describe('ValidateGithubAccountMiddleware', () => {
  const defaultRequest = {
    path: '/some-path',
    headers: {
      'x-github-event': 'some-event',
    },
  } as unknown as Request;
  const authorizedRequest = {
    path: envConfig.GITHUB_WEBHOOK_PATH,
    body: {
      installation: {
        account: {
          login: 'test-account',
        },
      },
    },
    headers: {
      'x-github-event': 'some-event',
    },
  } as unknown as Request;
  const validAccount = 'test-account';
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    next = vi.fn();
  });

  it('should call next() if the path is not GITHUB_WEBHOOK_PATH', async () => {
    await validateGitHubAccountMiddleware(defaultRequest, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if the account name does not exist in the body', async () => {
    await validateGitHubAccountMiddleware(
      { ...authorizedRequest, body: {} } as Request,
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Account not identified',
    });
  });

  it('should return 403 if the account is not authorized', async () => {
    vi.spyOn(
      testAccountRepository,
      'findTestAccountByName',
    ).mockResolvedValueOnce(null);

    await validateGitHubAccountMiddleware(authorizedRequest, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'The account does not have permissions to use this app',
    });
  });

  it('should call next() if the account is authorized', async () => {
    vi.spyOn(
      testAccountRepository,
      'findTestAccountByName',
    ).mockResolvedValueOnce({
      id: '1',
      name: validAccount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await validateGitHubAccountMiddleware(authorizedRequest, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 500 if an error occurs', async () => {
    await validateGitHubAccountMiddleware(
      { path: envConfig.GITHUB_WEBHOOK_PATH } as Request,
      res,
      next,
    );

    expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error when validating account',
    });
  });
});
