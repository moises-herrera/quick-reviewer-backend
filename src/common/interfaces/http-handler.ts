import { Request, Response } from 'express';

export type HttpHandler = (req: Request, res: Response) => Promise<void>;
