import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';
import { OAuthSession } from 'src/common/interfaces/oauth-session';
import { handleHttpExceptionMiddleware } from 'src/common/middlewares/handle-http-exception.middleware';

export const gitHubOAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, state } = req.query;

    if (
      !(req.session as unknown as OAuthSession) ||
      state !== (req.session as unknown as OAuthSession)?.oauthState
    ) {
      throw new HttpException('Invalid state parameter', StatusCodes.FORBIDDEN);
    }

    if (!code) {
      throw new HttpException(
        'Missing code parameter',
        StatusCodes.BAD_REQUEST,
      );
    }

    next();
  } catch (error) {
    handleHttpExceptionMiddleware(error, req, res);
  }
};
