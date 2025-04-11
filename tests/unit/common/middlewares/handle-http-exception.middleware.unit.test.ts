import { Request, Response } from 'express';
import { container } from 'src/app/config/container-config';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { HttpException } from 'src/common/exceptions/http-exception';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import * as middleware from 'src/common/middlewares/handle-http-exception.middleware';
import { MockLoggerService } from 'tests/mocks/mock-logger.service';

describe('HandleHttpExceptionMiddleware', () => {
  const mockLoggerService = new MockLoggerService();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(container, 'get').mockImplementation((serviceIdentifier) => {
      if (serviceIdentifier === LoggerService) {
        return mockLoggerService;
      }
      return vi.fn();
    });
  });

  describe('getHttpException', () => {
    it('should return HttpException when error is an instance of HttpException', () => {
      const error = new HttpException('Test error', 400);
      const result = middleware.getHttpException(error);
      expect(result).toBeInstanceOf(HttpException);
      expect(result.message).toBe('Test error');
      expect(result.statusCode).toBe(400);
    });

    it('should return HttpException with default values when error is not an instance of HttpException', () => {
      const error = new Error('Test error');
      const result = middleware.getHttpException(error);
      expect(result).toBeInstanceOf(HttpException);
      expect(result.message).toBe('Something went wrong');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('handleHttpException', () => {
    it('should log an exception', () => {
      const spyLogException = vi
        .spyOn(container.get(LoggerService), 'logException')
        .mockImplementation(() => {});
      const error = new HttpException('Test error', 400);
      const mockRequest = {
        path: '/test',
        method: 'GET',
        userId: '123',
      } as unknown as AuthRequest;
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const expectedError = {
        statusCode: error.statusCode,
        path: mockRequest.path,
        method: mockRequest.method,
        userId: mockRequest.userId,
        timestamp: error.timestamp,
        name: error.name,
        stack: error.stack,
        errorDetails: error,
      };

      middleware.handleHttpException(error, mockRequest, mockResponse);

      expect(spyLogException).toHaveBeenCalledWith(
        `HTTP Exception: ${error.message}`,
        expectedError,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(error.statusCode);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: error.message,
      });
    });
  });

  describe('handleNotFoundRoute', () => {
    it('should return 404 status and "Not found" message', () => {
      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      middleware.handleNotFoundRoute({} as unknown as Request, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Not found',
      });
    });
  });
});
