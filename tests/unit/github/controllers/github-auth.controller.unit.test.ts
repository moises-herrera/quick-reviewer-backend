import { Octokit } from '@octokit/rest';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { envConfig } from 'src/app/config/env-config';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { RegisterUserService } from 'src/github/abstracts/register-user.abstract';
import { gitHubAuthApp } from 'src/github/config/github-auth-app';
import {
  GITHUB_ACCESS_TOKEN,
  GITHUB_REFRESH_TOKEN,
  OAUTH_STATE,
} from 'src/github/constants/auth';
import { GitHubAuthController } from 'src/github/controllers/github-auth.controller';
import { MockUserRepository } from 'tests/mocks/repositories/mock-user.repository';
import { MockRegisterUserService } from 'tests/mocks/services/mock-register-user.service';

const mockOctokit = vi.hoisted(() => ({
  request: vi.fn(),
}));

vi.mock('@octokit/rest', () => ({
  Octokit: class {
    constructor() {
      return mockOctokit;
    }
  },
}));

vi.mock('src/github/config/github-auth-app', () => ({
  gitHubAuthApp: {
    getWebFlowAuthorizationUrl: vi.fn(() => ({
      url: 'http://example.com/auth',
    })),
    createToken: vi.fn(),
    refreshToken: vi.fn(),
    checkToken: vi.fn(),
  },
}));

describe('GitHubAuthController', () => {
  let controller: GitHubAuthController;
  let userRepository: UserRepository;
  let registerUserService: RegisterUserService;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    registerUserService = new MockRegisterUserService();
    controller = new GitHubAuthController(userRepository, registerUserService);
  });

  describe('getAuthorizationUrl', () => {
    it('should redirect to GitHub authorization URL', () => {
      const req = {} as Request;
      const res = {
        redirect: vi.fn(),
        cookie: vi.fn(),
      } as unknown as Response;

      controller.getAuthorizationUrl(req, res, () => {});

      expect(res.redirect).toHaveBeenCalledWith('http://example.com/auth');
      expect(res.cookie).toHaveBeenCalledWith(OAUTH_STATE, expect.any(String), {
        httpOnly: true,
        maxAge: 1000 * 60 * 5,
        sameSite: 'strict',
        secure: false,
      });
    });

    it('should handle errors', () => {
      const req = {} as Request;
      const res = {} as Response;
      const next = vi.fn();

      vi.spyOn(
        gitHubAuthApp,
        'getWebFlowAuthorizationUrl',
      ).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      controller.getAuthorizationUrl(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getAccessToken', () => {
    let req: Request;
    let res: Response;
    let next: () => void;
    const user = {
      id: 1,
      name: 'test',
      login: 'test_login',
      notification_email: 'test@email.com',
    };
    const mappedUser: User = {
      id: user.id.toString(),
      name: user.name,
      username: user.login,
      email: user.notification_email ?? null,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    beforeEach(() => {
      req = {
        query: { code: 'test_code' },
      } as unknown as Request;
      res = {
        clearCookie: vi.fn(),
        redirect: vi.fn(),
        cookie: vi.fn(),
      } as unknown as Response;
      next = vi.fn();

      vi.spyOn(gitHubAuthApp, 'createToken').mockResolvedValue({
        authentication: {
          token: 'test_token',
          refreshToken: 'test_token',
        },
      } as Awaited<ReturnType<typeof gitHubAuthApp.createToken>>);

      vi.spyOn(mockOctokit, 'request').mockResolvedValue({
        data: user,
      } as Awaited<ReturnType<typeof Octokit.prototype.request>>);
    });

    it('should get access token and redirect to success URL', async () => {
      vi.spyOn(userRepository, 'getUserById').mockResolvedValue(mappedUser);

      await controller.getAccessToken(req, res, next);

      expect(res.clearCookie).toHaveBeenCalledWith(OAUTH_STATE);
      expect(gitHubAuthApp.createToken).toHaveBeenCalledWith({
        code: 'test_code',
      });
      expect(res.redirect).toHaveBeenCalledWith(
        `${envConfig.FRONTEND_URL}/dashboard`,
      );
    });

    it('should register a new user', async () => {
      vi.spyOn(userRepository, 'getUserById').mockResolvedValue(null);

      await controller.getAccessToken(req, res, next);

      expect(registerUserService.registerUserData).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id.toString(),
          name: user.name,
          username: user.login,
          email: user.notification_email ?? null,
        }),
      );
    });

    it('should register the history of an existing user', async () => {
      vi.spyOn(userRepository, 'getUserById').mockResolvedValue(mappedUser);

      await controller.getAccessToken(req, res, next);

      expect(registerUserService.setGitProvider).toHaveBeenCalledWith(
        mockOctokit,
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(mappedUser.id);
      expect(registerUserService.registerHistory).toHaveBeenCalledWith(
        mappedUser,
      );
      expect(res.cookie).toHaveBeenCalledWith(
        GITHUB_ACCESS_TOKEN,
        'test_token',
        {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
          sameSite: 'strict',
          secure: false,
        },
      );
      expect(res.cookie).toHaveBeenCalledWith(
        GITHUB_REFRESH_TOKEN,
        'test_token',
        {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 30,
          sameSite: 'strict',
          secure: false,
        },
      );
    });

    it('should handle errors', async () => {
      vi.spyOn(gitHubAuthApp, 'createToken').mockRejectedValue(
        new Error('Test error'),
      );

      await controller.getAccessToken(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith(
        `${envConfig.FRONTEND_URL}/auth/login?error=true`,
      );
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('checkToken', () => {
    it('should check token and return user data', async () => {
      const req = {
        userId: '1',
      } as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      vi.spyOn(userRepository, 'getUserById').mockResolvedValue({
        id: '1',
      } as User);

      await controller.checkToken(req, res, () => {});

      expect(userRepository.getUserById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: '1' },
      });
    });

    it('should handle errors', async () => {
      const req = {
        userId: '1',
      } as AuthRequest;
      const res = {} as Response;
      const next = vi.fn();

      vi.spyOn(userRepository, 'getUserById').mockRejectedValue(new Error());

      await controller.checkToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and return user data', async () => {
      const req = {
        cookies: {
          githubRefreshToken: 'test_refresh_token',
        },
      } as unknown as Request;
      const res = {
        cookie: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      vi.spyOn(gitHubAuthApp, 'refreshToken').mockResolvedValue({
        authentication: {
          token: 'test_token',
          refreshToken: 'test_token',
        },
      } as Awaited<ReturnType<typeof gitHubAuthApp.refreshToken>>);

      vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
        status: StatusCodes.OK,
        data: {
          user: {
            id: '1',
          },
        },
      } as unknown as Awaited<ReturnType<typeof gitHubAuthApp.checkToken>>);

      vi.spyOn(userRepository, 'getUserById').mockResolvedValue({
        id: '1',
      } as User);

      await controller.refreshToken(req, res, () => {});

      expect(res.cookie).toHaveBeenCalledWith(
        GITHUB_ACCESS_TOKEN,
        'test_token',
        {
          httpOnly: true,
          maxAge: 1000 * 60 * 60,
          sameSite: 'strict',
          secure: false,
        },
      );
      expect(res.cookie).toHaveBeenCalledWith(
        GITHUB_REFRESH_TOKEN,
        'test_token',
        {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 30,
          sameSite: 'strict',
          secure: false,
        },
      );
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        user: { id: '1' },
      });
    });

    it('should return an error if refresh token is not provided', async () => {
      const req = {
        cookies: {},
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      await controller.refreshToken(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Refresh token not provided',
          statusCode: StatusCodes.BAD_REQUEST,
        }),
      );
    });

    it('should return an error if checkToken fails', async () => {
      const req = {
        cookies: {
          githubRefreshToken: 'test_refresh_token',
        },
      } as unknown as Request;
      const res = {
        cookie: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
        status: StatusCodes.BAD_REQUEST,
        data: {
          user: null,
        },
      } as unknown as Awaited<ReturnType<typeof gitHubAuthApp.checkToken>>);

      await controller.refreshToken(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error getting the user information',
          statusCode: StatusCodes.BAD_REQUEST,
        }),
      );
    });

    it('should return the default error if checkToken fails', async () => {
      const req = {
        cookies: {
          githubRefreshToken: 'test_refresh_token',
        },
      } as unknown as Request;
      const res = {
        cookie: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
        data: {
          user: null,
        },
      } as unknown as Awaited<ReturnType<typeof gitHubAuthApp.checkToken>>);

      await controller.refreshToken(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error getting the user information',
          statusCode: StatusCodes.BAD_REQUEST,
        }),
      );
    });

    it('should return an error if the user is not found', async () => {
      const req = {
        cookies: {
          githubRefreshToken: 'test_refresh_token',
        },
      } as unknown as Request;
      const res = {
        cookie: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      vi.spyOn(gitHubAuthApp, 'refreshToken').mockResolvedValue({
        authentication: {
          token: 'test_token',
          refreshToken: 'test_token',
        },
      } as Awaited<ReturnType<typeof gitHubAuthApp.refreshToken>>);

      vi.spyOn(gitHubAuthApp, 'checkToken').mockResolvedValue({
        status: StatusCodes.OK,
        data: {
          user: {
            id: '1',
          },
        },
      } as unknown as Awaited<ReturnType<typeof gitHubAuthApp.checkToken>>);

      vi.spyOn(userRepository, 'getUserById').mockResolvedValue(null);

      await controller.refreshToken(req, res, next);

      expect(userRepository.getUserById).toHaveBeenCalledWith('1');
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'The user is not registered',
          statusCode: StatusCodes.NOT_FOUND,
        }),
      );
    });
  });

  describe('logout', () => {
    it('should clear cookies', () => {
      const req = {} as Request;
      const res = {
        clearCookie: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;

      controller.logout(req, res, () => {});

      expect(res.clearCookie).toHaveBeenCalledWith(GITHUB_ACCESS_TOKEN);
      expect(res.clearCookie).toHaveBeenCalledWith(GITHUB_REFRESH_TOKEN);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    it('should handle errors', () => {
      const req = {} as Request;
      const res = {
        clearCookie: vi.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
      } as unknown as Response;
      const next = vi.fn();

      controller.logout(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
