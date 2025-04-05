/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from '../exceptions/http-exception';
import { container } from 'src/app/config/container-config';
import { LoggerService } from 'src/common/abstracts/logger.service';

export const getHttpException = (error: unknown) => {
  const httpException =
    error instanceof HttpException
      ? error
      : new HttpException(
          'Something went wrong',
          StatusCodes.INTERNAL_SERVER_ERROR,
          error,
        );

  return httpException;
};

export const handleHttpException = (
  error: unknown,
  req: Request,
  res: Response,
  _next?: NextFunction,
): void => {
  const httpException = getHttpException(error);

  container
    .get(LoggerService)
    .logException(`HTTP Exception: ${httpException.message}`, {
      statusCode: httpException.statusCode,
      path: req.path,
      method: req.method,
      userId: 'userId' in req ? req.userId : undefined,
      timestamp: httpException.timestamp,
      ...(error instanceof Error && {
        name: error.name,
        stack: error.stack,
      }),
      ...(typeof error === 'object' &&
        error !== null && {
          errorDetails: error,
        }),
    });

  res.status(httpException.statusCode).json(<Record<string, string>>{
    message: httpException.message,
  });
};

export const handleNotFoundRoute = (_req: Request, res: Response): void => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: 'Not found',
  });
};
