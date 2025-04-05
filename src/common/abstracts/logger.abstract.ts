import { injectable } from 'inversify';

@injectable()
export abstract class LoggerService {
  abstract debug(message: string, meta?: Record<string, unknown>): void;
  abstract log(message: string, meta?: Record<string, unknown>): void;
  abstract info(message: string, meta?: Record<string, unknown>): void;
  abstract warn(message: string, meta?: Record<string, unknown>): void;
  abstract error(message: string, meta?: Record<string, unknown>): void;
  abstract logException(
    error: Error | unknown,
    meta?: Record<string, unknown>,
  ): void;
}
