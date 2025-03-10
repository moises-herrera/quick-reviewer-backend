/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../exceptions/http-exception';

export const getHttpException = (error: unknown) => {
  const httpException =
    error instanceof HttpException
      ? error
      : new HttpException(
          'Something went wrong',
          StatusCodes.INTERNAL_SERVER_ERROR,
        );

  return httpException;
};

export const handleHttpException = (
  error: unknown,
  _req: Request,
  res: Response,
  _next?: NextFunction,
): void => {
  console.error(error);

  const httpException = getHttpException(error);

  res.status(httpException.statusCode).json(<Record<string, string>>{
    message: httpException.message,
  });
};

export const handleNotFoundRoute = (_req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: 'Not found',
  });
};
