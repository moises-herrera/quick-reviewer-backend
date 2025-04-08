import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';

describe('HttpException', () => {
  it('should create an instance of HttpException', () => {
    const error = new Error('Original error');
    const exception = new HttpException(
      'Custom error',
      StatusCodes.BAD_REQUEST,
      error,
    );

    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.name).toBe('HttpException');
    expect(exception.message).toBe('Custom error');
    expect(exception.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(exception.timestamp).toBeInstanceOf(Date);
    expect(exception.originalError).toBe(error);
  });

  it('should create an instance of HttpException with the default status code', () => {
    const exception = new HttpException('Custom error');

    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.name).toBe('HttpException');
    expect(exception.message).toBe('Custom error');
    expect(exception.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(exception.timestamp).toBeInstanceOf(Date);
  });

  it('should serialize to JSON correctly', () => {
    const exception = new HttpException(
      'Custom error',
      StatusCodes.BAD_REQUEST,
    );
    const exceptionSerialized = exception.toJSON();
    expect(exceptionSerialized).toEqual({
      name: 'HttpException',
      message: 'Custom error',
      statusCode: StatusCodes.BAD_REQUEST,
      timestamp: exception.timestamp,
      stack: expect.any(String),
    });
  });
});
