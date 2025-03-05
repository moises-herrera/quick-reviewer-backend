import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { gitHubAuthApp } from '../github-auth-app';
import { HttpException } from 'src/common/exceptions/http-exception';
import { handleHttpExceptionMiddleware } from 'src/common/middlewares/handle-http-exception.middleware';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { UserService } from 'src/users/services/user.service';

export const gitHubAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.cookies.githubToken) {
      throw new HttpException('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    try {
      const { githubToken } = req.cookies;

      const {
        data: { user },
      } = await gitHubAuthApp.checkToken({
        token: githubToken,
      });

      if (!user) {
        throw new HttpException(
          'Error getting the user information',
          StatusCodes.UNAUTHORIZED,
        );
      }

      const userService = new UserService();
      const existingUser = userService.getUserById(
        user.id as unknown as bigint,
      );

      if (!existingUser) {
        throw new HttpException(
          'The user is not registered',
          StatusCodes.UNAUTHORIZED,
        );
      }

      (req as AuthRequest).userId = user?.id as number;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException('Unauthorized', StatusCodes.UNAUTHORIZED, error);
    }

    next();
  } catch (error) {
    handleHttpExceptionMiddleware(error, req, res);
  }
};
