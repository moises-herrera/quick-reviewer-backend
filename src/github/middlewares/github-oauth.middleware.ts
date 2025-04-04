import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';

export const gitHubOAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { code, state } = req.query;
    const { oauthState } = req.cookies;

    if (!oauthState || state !== oauthState) {
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
    next(error);
  }
};
