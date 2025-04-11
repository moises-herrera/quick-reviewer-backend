import { AppLoggerService } from 'src/common/services/app-logger.service';
import winston from 'winston';
import fs from 'node:fs';
import { Mock, vi } from 'vitest';
import { envConfig } from 'src/app/config/env-config';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

vi.mock('node:path', () => ({
  default: {
    join: vi.fn().mockImplementation((...args) => args.join('/')),
  },
}));

vi.mock('winston', () => {
  const mockWinstonLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  return {
    default: {
      createLogger: vi.fn().mockReturnValue(mockWinstonLogger),
      format: {
        combine: vi.fn(),
        timestamp: vi.fn().mockReturnValue('mockTimestamp'),
        errors: vi.fn().mockReturnValue('mockErrors'),
        splat: vi.fn().mockReturnValue('mockSplat'),
        json: vi.fn().mockReturnValue('mockJson'),
        colorize: vi.fn().mockReturnValue('mockColorize'),
        printf: vi.fn().mockReturnValue('mockPrintf'),
      },
      transports: {
        Console: vi.fn(),
        DailyRotateFile: vi.fn(),
      },
    },
  };
});

vi.mock('winston-daily-rotate-file');

vi.mock('src/app/config/env-config', () => ({
  envConfig: {
    NODE_ENV: 'development',
  },
}));

describe('AppLoggerService', () => {
  let loggerService: AppLoggerService;
  let mockWinstonLogger: winston.Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.existsSync as Mock).mockReturnValue(false);

    mockWinstonLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as winston.Logger;
    (winston.createLogger as Mock).mockReturnValue(mockWinstonLogger);

    loggerService = new AppLoggerService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create logs directory if it does not exist', () => {
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });

  it('should not create logs directory if it already exists', () => {
    vi.clearAllMocks();
    (fs.existsSync as Mock).mockReturnValue(true);

    new AppLoggerService();

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('should initialize winston logger with correct configuration', () => {
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'debug',
        defaultMeta: { service: 'quick-reviewer' },
        exitOnError: false,
      }),
    );

    expect(winston.transports.Console).toHaveBeenCalledTimes(1);
    expect(winston.transports.DailyRotateFile).toHaveBeenCalledTimes(2);
  });

  it('should use production log level when environment is production', () => {
    vi.clearAllMocks();
    (envConfig.NODE_ENV as string) = 'production';

    new AppLoggerService();

    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
      }),
    );
  });

  it('should log debug messages', () => {
    const message = 'Debug message';
    const meta = { key: 'value' };

    loggerService.debug(message, meta);

    expect(mockWinstonLogger.debug).toHaveBeenCalledWith(message, meta);
  });

  it('should log info messages', () => {
    const message = 'Info message';
    const meta = { key: 'value' };

    loggerService.info(message, meta);

    expect(mockWinstonLogger.info).toHaveBeenCalledWith(message, meta);
  });

  it('should call info when log is called', () => {
    const message = 'Log message';
    const meta = { key: 'value' };

    loggerService.log(message, meta);

    expect(mockWinstonLogger.info).toHaveBeenCalledWith(message, meta);
  });

  it('should log warn messages', () => {
    const message = 'Warning message';
    const meta = { key: 'value' };

    loggerService.warn(message, meta);

    expect(mockWinstonLogger.warn).toHaveBeenCalledWith(message, meta);
  });

  it('should log error messages', () => {
    const message = 'Error message';
    const meta = { key: 'value' };

    loggerService.error(message, meta);

    expect(mockWinstonLogger.error).toHaveBeenCalledWith(message, meta);
  });

  it('should log exceptions with error object', () => {
    const error = new Error('Test error');
    const meta = { key: 'value' };

    loggerService.logException(error, meta);

    expect(mockWinstonLogger.error).toHaveBeenCalledWith(
      `Exception: ${error.message}`,
      expect.objectContaining({
        ...meta,
        name: error.name,
        stack: error.stack,
      }),
    );
  });

  it('should log string exceptions', () => {
    const error = 'String error';
    const meta = { key: 'value' };

    loggerService.logException(error, meta);

    expect(mockWinstonLogger.error).toHaveBeenCalledWith(
      `Exception: ${error}`,
      meta,
    );
  });

  it('should log object exceptions', () => {
    const error = { custom: 'error' };
    const meta = { key: 'value' };

    loggerService.logException(error, meta);

    expect(mockWinstonLogger.error).toHaveBeenCalledWith(
      'Exception object:',
      expect.objectContaining({
        ...meta,
        errorObject: error,
      }),
    );
  });

  it('should handle other exception types', () => {
    const error = 42;
    const meta = { key: 'value' };

    loggerService.logException(error, meta);

    expect(mockWinstonLogger.error).toHaveBeenCalledWith(
      `Exception of type number:`,
      expect.objectContaining({
        ...meta,
        errorValue: error,
      }),
    );
  });
});
