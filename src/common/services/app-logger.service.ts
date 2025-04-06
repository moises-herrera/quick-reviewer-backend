import { injectable } from 'inversify';
import fs from 'node:fs';
import path from 'node:path';
import { envConfig } from 'src/app/config/env-config';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import winston from 'winston';
import 'winston-daily-rotate-file';

@injectable()
export class AppLoggerService implements LoggerService {
  private readonly LOGS_DIRECTORY = path.join(__dirname, '../../../logs');
  private readonly logger: winston.Logger;

  constructor() {
    if (!fs.existsSync(this.LOGS_DIRECTORY)) {
      fs.mkdirSync(this.LOGS_DIRECTORY, { recursive: true });
    }

    const commonFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    const consoleFormat = winston.format.combine(
      commonFormat,
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      }),
    );

    this.logger = winston.createLogger({
      level: envConfig.NODE_ENV === 'production' ? 'info' : 'debug',
      defaultMeta: { service: 'quick-reviewer' },
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        new winston.transports.DailyRotateFile({
          filename: path.join(this.LOGS_DIRECTORY, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: commonFormat,
        }),
        new winston.transports.DailyRotateFile({
          filename: path.join(this.LOGS_DIRECTORY, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: commonFormat,
        }),
      ],
      exitOnError: false,
    });
  }

  debug(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.debug(message, meta);
  }

  log(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info(message, meta);
  }

  info(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta: Record<string, unknown> = {}): void {
    this.logger.error(message, meta);
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
