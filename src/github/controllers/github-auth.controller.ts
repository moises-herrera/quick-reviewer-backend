import { OAuthSession } from 'src/common/interfaces/oauth-session';
import { gitHubAuthApp } from '../config/github-auth-app';
import { envConfig } from 'src/config/env-config';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';
import { CryptoService } from 'src/common/services/crypto.service';
import { CookieService } from 'src/common/services/cookie.service';
import { Octokit } from '@octokit/rest';
import { User } from '@prisma/client';
import {
  AuthHttpHandler,
  HttpHandler,
} from 'src/common/interfaces/http-handler';
import { inject } from 'inversify';
import { UserRepository } from 'src/core/repositories/user-repository.interface';
import { RegisterUserService } from 'src/core/services/register-user.service';

export class GitHubAuthController {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
    @inject(RegisterUserService)
    private readonly registerUserService: RegisterUserService,
  ) {}

  getAuthorizationUrl: HttpHandler = async (req, res, next): Promise<void> => {
    try {
      const state = CryptoService.generateRandomBytes(16);
      const { url } = gitHubAuthApp.getWebFlowAuthorizationUrl({
        state,
      });

      (req.session as unknown as OAuthSession).oauthState = state;

      res.redirect(url);
    } catch (error) {
      next(error);
    }
  };

  getAccessToken: HttpHandler = async (req, res, next): Promise<void> => {
    try {
      const { code } = req.query;
      let authentication:
        | Awaited<
            ReturnType<typeof gitHubAuthApp.createToken>
          >['authentication']
        | undefined;

      try {
        const result = await gitHubAuthApp.createToken({
          code: code as string,
        });
        authentication = result.authentication;
      } catch (error) {
        throw new HttpException(
          'Error getting access token',
          StatusCodes.INTERNAL_SERVER_ERROR,
          error,
        );
      }

      const octokit = new Octokit({ auth: authentication?.token });
      this.registerUserService.setGitProvider(octokit);

      const { data: user } = await octokit.request('GET /user');

      const existingUser = await this.userRepository.getUserById(
        user.id as unknown as bigint,
      );

      if (!existingUser) {
        const userData: User = {
          id: user.id as unknown as bigint,
          name: user.name,
          username: user.login,
          email: user.notification_email ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.registerUserService.registerUserData(userData);
      } else {
        await this.registerUserService.registerHistory(existingUser);
      }

      CookieService.setCookie(res, 'githubToken', authentication.token);
      CookieService.setCookie(
        res,
        'githubRefreshToken',
        authentication.refreshToken || '',
        { maxAge: 1000 * 60 * 60 * 24 * 30 },
      );

      res.redirect(`${envConfig.FRONTEND_URL}/dashboard`);
    } catch (error) {
      res.redirect(`${envConfig.FRONTEND_URL}/auth/login?error=true`);
      next(error);
    }
  };

  checkToken: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const { userId } = req;

      const user = await this.userRepository.getUserById(
        userId as unknown as bigint,
      );

      res.status(StatusCodes.OK).json({
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken: HttpHandler = async (req, res, next): Promise<void> => {
    try {
      const { githubRefreshToken } = req.cookies;

      if (!githubRefreshToken) {
        throw new HttpException(
          'Refresh token not provided',
          StatusCodes.BAD_REQUEST,
        );
      }

      const { authentication } = await gitHubAuthApp.refreshToken({
        refreshToken: githubRefreshToken,
      });

      CookieService.setCookie(res, 'githubToken', authentication.token);
      CookieService.setCookie(
        res,
        'githubRefreshToken',
        authentication.refreshToken || '',
        { maxAge: 1000 * 60 * 60 * 24 * 30 },
      );

      const {
        status,
        data: { user },
      } = await gitHubAuthApp.checkToken({
        token: authentication.token,
      });

      if (status >= 400 || !user) {
        throw new HttpException(
          'Error getting the user information',
          status || StatusCodes.BAD_REQUEST,
        );
      }

      const existingUser = await this.userRepository.getUserById(
        user.id as unknown as bigint,
      );

      if (!existingUser) {
        throw new HttpException(
          'The user is not registered',
          StatusCodes.NOT_FOUND,
        );
      }

      res.status(StatusCodes.OK).json({
        user: existingUser,
      });
    } catch (error) {
      next(error);
    }
  };

  logout: HttpHandler = async (req, res, next): Promise<void> => {
    try {
      req.session.destroy((err) => {
        if (err) {
          throw new HttpException(
            'Error destroying session',
            StatusCodes.INTERNAL_SERVER_ERROR,
            err,
          );
        }

        res.clearCookie('githubToken');
        res.clearCookie('githubRefreshToken');
        res.status(StatusCodes.OK).json({
          message: 'Logged out successfully',
        });
      });
    } catch (error) {
      next(error);
    }
  };
}
