import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../exceptions/http-exception';

export const handleHttpExceptionMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
): void => {
  console.error(error);

  const httpException =
    error instanceof HttpException
      ? error
      : new HttpException(
          'Something went wrong',
          StatusCodes.INTERNAL_SERVER_ERROR,
        );

  if ('status' in res) {
    res.status(httpException.statusCode).json(<Record<string, string>>{
      message: httpException.message,
    });
    return;
  }

  (res as NextFunction)();
};
