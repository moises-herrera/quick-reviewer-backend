import { UserAccount } from '@prisma/client';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { accountSettingsPermissionsMiddleware } from 'src/accounts/middlewares/account-settings-permissions.middleware';
import { container } from 'src/app/config/container-config';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { MockUserRepository } from 'tests/mocks/repositories/mock-user.repository';

describe('AccountSettingsPermissionsMiddleware', () => {
  const userRepository = new MockUserRepository();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(container, 'get').mockImplementation((serviceIdentifier) => {
      if (serviceIdentifier === UserRepository) {
        return userRepository;
      }
      return vi.fn();
    });
  });

  it('should not call next if user does not have permission', async () => {
    const req = {
      userId: 'userId',
      params: { accountId: 'accountId' },
    } as unknown as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    vi.spyOn(userRepository, 'getUserAccount').mockResolvedValue({
      canConfigureBot: false,
    } as unknown as UserAccount);

    await accountSettingsPermissionsMiddleware(req, res, next);

    expect(userRepository.getUserAccount).toHaveBeenCalledWith(
      req.userId,
      req.params.accountId,
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You do not have permission to manage this account',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should not call next if the user account is not found', async () => {
    const req = {
      userId: 'userId',
      params: { accountId: 'accountId' },
    } as unknown as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    vi.spyOn(userRepository, 'getUserAccount').mockResolvedValue(null);

    await accountSettingsPermissionsMiddleware(req, res, next);

    expect(userRepository.getUserAccount).toHaveBeenCalledWith(
      req.userId,
      req.params.accountId,
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You do not have permission to manage this account',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user has permission', async () => {
    const req = {
      userId: 'userId',
      params: { accountId: 'accountId' },
    } as unknown as AuthRequest;
    const res = {} as unknown as Response;
    const next = vi.fn();

    vi.spyOn(userRepository, 'getUserAccount').mockResolvedValue({
      canConfigureBot: true,
    } as unknown as UserAccount);

    await accountSettingsPermissionsMiddleware(req, res, next);

    expect(userRepository.getUserAccount).toHaveBeenCalledWith(
      req.userId,
      req.params.accountId,
    );
    expect(next).toHaveBeenCalled();
  });
});
