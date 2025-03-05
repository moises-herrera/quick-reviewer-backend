import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class HealthCheckController {
  async getHealthStatus(_req: Request, res: Response): Promise<void> {
    res.status(StatusCodes.OK).json({ status: 'ok' });
  }
}
