import { CookieOptions, Response } from 'express';
import { envConfig } from 'src/config/env-config';

export class CookieService {
  private static readonly defaultCookieSettings: CookieOptions = {
    httpOnly: true,
    secure: envConfig.NODE_ENV === 'production',
    sameSite: envConfig.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 1000 * 60 * 60,
  };

  static setCookie(
    res: Response,
    name: string,
    value: string,
    options?: Partial<CookieOptions>,
  ) {
    res.cookie(name, value, {
      ...this.defaultCookieSettings,
      ...options,
    });
  }
}
