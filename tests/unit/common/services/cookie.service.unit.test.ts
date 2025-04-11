import { CookieOptions, Response } from 'express';
import { CookieService } from 'src/common/services/cookie.service';

describe('CookieService', () => {
  it('should set cookie with default settings', () => {
    const mockResponse = {
      cookie: vi.fn(),
    } as unknown as Response;

    const cookieName = 'testCookie';
    const cookieValue = 'testValue';

    CookieService.setCookie(mockResponse, cookieName, cookieValue);

    expect(mockResponse.cookie).toHaveBeenCalledWith(cookieName, cookieValue, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60,
    });
  });

  it('should set cookie with custom options', () => {
    const mockResponse = {
      cookie: vi.fn(),
    } as unknown as Response;

    const cookieName = 'testCookie';
    const cookieValue = 'testValue';
    const customOptions: Partial<CookieOptions> = {
      maxAge: 1000 * 60 * 30,
      sameSite: 'lax',
    };

    CookieService.setCookie(
      mockResponse,
      cookieName,
      cookieValue,
      customOptions,
    );

    expect(mockResponse.cookie).toHaveBeenCalledWith(cookieName, cookieValue, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 30,
    });
  });
});
