import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z, ZodError } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateBody = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const bodyParsed = schema.parse(req.body);
      req.body = bodyParsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(({ path, message }) => ({
          message: `${path.join('.')} is ${message}`,
        }));

        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: 'Invalid data', details: errorMessages });

        return;
      }

      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Something went wrong' });
    }
  };
};
