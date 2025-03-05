import crypto from 'node:crypto';
import { OAuthSession } from 'src/common/interfaces/oauth-session';
import { gitHubAuthApp } from '../github-auth-app';
import { HttpHandler } from 'src/common/interfaces/http-handler';
import { envConfig } from 'src/config/env-config';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';
import { handleHttpExceptionMiddleware } from 'src/common/middlewares/handle-http-exception.middleware';

export class GitHubController {
  getAuthorizationUrl: HttpHandler = async (req, res): Promise<void> => {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      const { url } = gitHubAuthApp.getWebFlowAuthorizationUrl({
        state,
      });

      (req.session as unknown as OAuthSession).oauthState = state;

      res.redirect(url);
    } catch (error) {
      return handleHttpExceptionMiddleware(error, req, res);
    }
  };

  getAccessToken: HttpHandler = async (req, res): Promise<void> => {
    try {
      const { code, state } = req.query;

      if (
        !(req.session as unknown as OAuthSession) ||
        state !== (req.session as unknown as OAuthSession)?.oauthState
      ) {
        throw new HttpException(
          'Invalid state parameter',
          StatusCodes.FORBIDDEN,
        );
      }

      if (!code) {
        throw new HttpException(
          'Missing code parameter',
          StatusCodes.BAD_REQUEST,
        );
      }

      try {
        const { authentication } = await gitHubAuthApp.createToken({
          code: code as string,
        });

        res.cookie('githubToken', authentication.token, {
          httpOnly: true,
          secure: envConfig.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        res.redirect(`${envConfig.FRONTEND_URL}/dashboard`);
      } catch (error) {
        throw new HttpException(
          'Error getting access token',
          StatusCodes.INTERNAL_SERVER_ERROR,
          error,
        );
      }
    } catch (error) {
      return handleHttpExceptionMiddleware(error, req, res);
    }
  };
}
