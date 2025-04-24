import { container } from 'src/app/config/container-config';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { MockUserRepository } from 'tests/mocks/repositories/mock-user.repository';
import { UserRepository as RepositoryWithAccess } from '@prisma/client';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { NextFunction, Response } from 'express';
import { repositorySettingsPermissionsMiddleware } from 'src/repositories/middlewares/repository-settings-permissions.middleware';
import { StatusCodes } from 'http-status-codes';

describe('RepositorySettingsPermissionsMiddleware', () => {
  const userRepository = new MockUserRepository();
  const req = {
    userId: '1',
    params: {
      repositoryId: '2',
    },
  } as unknown as AuthRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(container, 'get').mockImplementation((serviceIdentifier) => {
      if (serviceIdentifier === UserRepository) {
        return userRepository;
      }
      return vi.fn();
    });

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    next = vi.fn();
  });

  it('should not call next if user does not have permission', async () => {
    vi.spyOn(userRepository, 'getUserRepository').mockResolvedValueOnce({
      canConfigureBot: false,
    } as unknown as RepositoryWithAccess);

    await repositorySettingsPermissionsMiddleware(req, res, next);
    expect(userRepository.getUserRepository).toHaveBeenCalledWith(
      req.userId,
      req.params.repositoryId,
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You do not have permission to manage this repository',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should not call next if the user repository does not exist', async () => {
    vi.spyOn(userRepository, 'getUserRepository').mockResolvedValueOnce(null);

    await repositorySettingsPermissionsMiddleware(req, res, next);
    expect(userRepository.getUserRepository).toHaveBeenCalledWith(
      req.userId,
      req.params.repositoryId,
    );
    expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'You do not have permission to manage this repository',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user has permission', async () => {
    vi.spyOn(userRepository, 'getUserRepository').mockResolvedValueOnce({
      canConfigureBot: true,
    } as unknown as RepositoryWithAccess);

    await repositorySettingsPermissionsMiddleware(req, res, next);
    expect(userRepository.getUserRepository).toHaveBeenCalledWith(
      req.userId,
      req.params.repositoryId,
    );
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
