import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { gitHubAuthApp } from 'src/github/config/github-auth-app';
import { gitHubAuthMiddleware } from 'src/github/middlewares/github-auth.middleware';

vi.mock('src/github/config/github-auth-app', () => ({
  gitHubAuthApp: {
    checkToken: vi.fn().mockResolvedValue({
      status: 200,
      data: { user: { id: '123' } },
    }),
  },
}));

const mockUserRepository = vi.hoisted(() => ({
  getUserById: vi.fn(),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: () => mockUserRepository,
  },
}));

describe('GitHub Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if githubToken is not present in cookies', async () => {
    const req = {
      cookies: {},
    } as Request;
    const res = {} as Response;
    const next = vi.fn();

    gitHubAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: StatusCodes.UNAUTHORIZED,
      }),
    );
  });

  it('should throw an error if the token is invalid', async () => {
    const req = {
      cookies: { githubToken: 'valid_token' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
      status: 400,
      data: {
        user: null,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await gitHubAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: StatusCodes.BAD_REQUEST,
      }),
    );
  });

  it('should throw an error using the default status code', async () => {
    const req = {
      cookies: { githubToken: 'valid_token' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
      data: {
        user: null,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await gitHubAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: StatusCodes.BAD_REQUEST,
      }),
    );
  });

  it('should throw an error if the user is not registered', async () => {
    const req = {
      cookies: { githubToken: 'valid_token' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
      status: 200,
      data: {
        user: {
          id: '123',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.spyOn(mockUserRepository, 'getUserById').mockResolvedValue(null);

    await gitHubAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: StatusCodes.NOT_FOUND,
      }),
    );
  });

  it('should throw an unexpected error', async () => {
    const req = {
      cookies: { githubToken: 'valid_token' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    vi.spyOn(gitHubAuthApp, 'checkToken').mockRejectedValue(new Error('Error'));

    await gitHubAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      }),
    );
  });

  it('should call next with the user if the token is valid and user is registered', async () => {
    const req = {
      cookies: { githubToken: 'valid_token' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
      status: 200,
      data: {
        user: {
          id: '123',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    vi.spyOn(mockUserRepository, 'getUserById').mockResolvedValue({
      id: '123',
    });

    await gitHubAuthMiddleware(req, res, next);

    expect(req).toEqual(
      expect.objectContaining({
        userId: '123',
      }),
    );
    expect(next).toHaveBeenCalled();
  });
});
