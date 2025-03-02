import { StatusCodes } from 'http-status-codes';

export class HttpException extends Error {
  constructor(
    public message: string,
    public statusCode: StatusCodes,
    public error?: unknown,
  ) {
    super(message);
  }
}
