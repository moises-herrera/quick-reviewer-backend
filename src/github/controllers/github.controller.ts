import { Request, Response } from 'express';
import { OAuthSession } from 'src/common/interfaces/oauth-session';
import { gitHubAuthApp } from '../github-auth-app';
import { envConfig } from 'src/config/env-config';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';
import { handleHttpExceptionMiddleware } from 'src/common/middlewares/handle-http-exception.middleware';
import { CryptoService } from 'src/common/services/crypto.service';
import { CookieService } from 'src/common/services/cookie.service';
import { RegisterUserService } from 'src/users/services/register-user.service';
import { Octokit } from '@octokit/rest';

export class GitHubController {
  async getAuthorizationUrl(req: Request, res: Response): Promise<void> {
    try {
      const state = CryptoService.generateRandomBytes(16);
      const { url } = gitHubAuthApp.getWebFlowAuthorizationUrl({
        state,
      });

      (req.session as unknown as OAuthSession).oauthState = state;

      res.redirect(url);
    } catch (error) {
      handleHttpExceptionMiddleware(error, req, res);
    }
  }

  async getAccessToken(req: Request, res: Response): Promise<void> {
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

      const registerUserService = new RegisterUserService(
        new Octokit({ auth: authentication?.token }),
      );
      await registerUserService.registerUserData();

      CookieService.setCookie(res, 'githubToken', authentication.token);
      CookieService.setCookie(
        res,
        'githubRefreshToken',
        authentication.refreshToken || '',
        { maxAge: 1000 * 60 * 60 * 24 * 30 },
      );

      res.redirect(`${envConfig.FRONTEND_URL}/dashboard`);
    } catch (error) {
      res.redirect(`${envConfig.FRONTEND_URL}/auth-error=true`);
      handleHttpExceptionMiddleware(error, req, res);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { githubRefreshToken } = req.cookies;

      if (!githubRefreshToken) {
        throw new HttpException(
          'Refresh token not provided',
          StatusCodes.UNAUTHORIZED,
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

      res.status(StatusCodes.OK).json({
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      handleHttpExceptionMiddleware(error, req, res);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
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
      handleHttpExceptionMiddleware(error, req, res);
    }
  }
}
