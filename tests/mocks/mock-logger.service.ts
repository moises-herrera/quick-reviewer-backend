import { LoggerService } from 'src/common/abstracts/logger.abstract';

export class MockLoggerService implements LoggerService {
  debug(message: string, meta: Record<string, unknown> = {}): void {
    console.debug(message, meta);
  }

  log(message: string, meta: Record<string, unknown> = {}): void {
    console.info(message, meta);
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    console.info(message, meta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    console.warn(message, meta);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    console.error(message, meta);
  }

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
