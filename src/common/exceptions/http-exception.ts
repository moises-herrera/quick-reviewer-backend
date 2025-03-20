import { StatusCodes } from 'http-status-codes';

export class HttpException extends Error {
  readonly statusCode: StatusCodes;
  readonly timestamp: Date;
  readonly originalError?: unknown;

  constructor(
    message: string,
    statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
    originalError?: unknown,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    this.originalError = originalError;

    Error.captureStackTrace(this, this.constructor);

    if (originalError instanceof Error && originalError.stack) {
      const currentStack = this.stack || '';
      const originalStack = originalError.stack;

      const errorLine = originalStack.split('\n')[0];
      const stackDetails = originalStack.split('\n').slice(1).join('\n');

      this.stack = `${currentStack}\nCaused by: ${errorLine}\n${stackDetails}`;
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: process.env.NODE_ENV !== 'production' ? this.stack : undefined,
    };
  }
}
