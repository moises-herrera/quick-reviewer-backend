import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../exceptions/http-exception';

export const exceptionMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
): void => {
  const httpException =
    error instanceof HttpException
      ? error
      : new HttpException(
          'Ha ocurrido un error',
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
