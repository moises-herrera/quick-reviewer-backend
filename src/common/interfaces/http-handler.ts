import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from './auth-request';

export type HttpHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export type AuthHttpHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;
