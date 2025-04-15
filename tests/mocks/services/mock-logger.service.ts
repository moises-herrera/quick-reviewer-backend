import { LoggerService } from 'src/common/abstracts/logger.abstract';

export class MockLoggerService implements LoggerService {
  debug(message: string, meta: Record<string, unknown> = {}): void {}

  log(message: string, meta: Record<string, unknown> = {}): void {}

  info(message: string, meta: Record<string, unknown> = {}): void {}

  warn(message: string, meta: Record<string, unknown> = {}): void {}

  error(message: string, meta: Record<string, unknown> = {}): void {}

  logException(
    error: Error | unknown,
    meta: Record<string, unknown> = {},
  ): void {
    if (error instanceof Error) {
      this.error(`Exception: ${error.message}`, {
        ...meta,
        name: error.name,
        stack: error.stack,
      });
    } else if (typeof error === 'string') {
      this.error(`Exception: ${error}`, meta);
    } else if (typeof error === 'object' && error !== null) {
      this.error('Exception object:', { ...meta, errorObject: error });
    } else {
      this.error(`Exception of type ${typeof error}:`, {
        ...meta,
        errorValue: error,
      });
    }
  }
}
