import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { gitHubAuthApp } from 'src/github/config/github-auth-app';
import { HttpException } from 'src/common/exceptions/http-exception';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { container } from 'src/app/config/container-config';
import { UserRepository } from 'src/common/database/abstracts/user.repository';

export const gitHubAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.cookies.githubToken) {
      throw new HttpException('Unauthorized', StatusCodes.UNAUTHORIZED);
    }

    try {
      const { githubToken } = req.cookies;

      const {
        status,
        data: { user },
      } = await gitHubAuthApp.checkToken({
        token: githubToken,
      });

      if (status >= 400 || !user) {
        throw new HttpException(
          'Error getting the user information',
          status || StatusCodes.BAD_REQUEST,
        );
      }

      const userService = container.get(UserRepository);
      const existingUser = await userService.getUserById(user.id.toString());

      if (!existingUser) {
        throw new HttpException(
          'The user is not registered',
          StatusCodes.NOT_FOUND,
        );
      }

      (req as AuthRequest).userId = user?.id.toString();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Something went wrong',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
