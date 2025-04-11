import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';
import { gitHubOAuthMiddleware } from 'src/github/middlewares/github-oauth.middleware';

describe('GitHub OAuth Middleware', () => {
  it('should throw an error if state is invalid', () => {
    const req = {
      query: {
        code: 'someCode',
        state: 'invalidState',
      },
      cookies: {
        oauthState: 'validState',
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    gitHubOAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new HttpException('Invalid state parameter', StatusCodes.FORBIDDEN),
    );
  });

  it('should throw an error if code is missing', () => {
    const req = {
      query: {
        state: 'validState',
      },
      cookies: {
        oauthState: 'validState',
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    gitHubOAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new HttpException('Missing code parameter', StatusCodes.BAD_REQUEST),
    );
  });

  it('should call next if state and code are valid', () => {
    const req = {
      query: {
        code: 'someCode',
        state: 'validState',
      },
      cookies: {
        oauthState: 'validState',
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    gitHubOAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
