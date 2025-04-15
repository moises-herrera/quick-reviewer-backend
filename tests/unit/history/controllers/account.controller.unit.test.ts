import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { AccountController } from 'src/history/controllers/account.controller';
import { MockAccountRepository } from 'tests/mocks/repositories/mock-account.repository';

describe('AccountController', () => {
  let controller: AccountController;
  let accountRepository: AccountRepository;

  beforeEach(() => {
    accountRepository = new MockAccountRepository();
    controller = new AccountController(accountRepository);
  });

  describe('getAllAccounts', () => {
    it('should call accountRepository.getPaginatedAccounts with correct parameters', async () => {
      const req = {
        userId: 'userId',
        query: { search: '', page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getAllAccounts(req, res, next);

      expect(accountRepository.getPaginatedAccounts).toHaveBeenCalledWith({
        userId: 'userId',
        search: '',
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if an error occurs', async () => {
      const req = {
        userId: 'userId',
        query: { page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {} as Response;
      const next = vi.fn();
      vi.spyOn(accountRepository, 'getPaginatedAccounts').mockRejectedValue(
        new Error('Error'),
      );

      await controller.getAllAccounts(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error('Error'));
    });
  });

  describe('getOrganizations', () => {
    it('should call accountRepository.getOrganizations with correct parameters', async () => {
      const req = {
        userId: 'userId',
        query: { search: '', page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getOrganizations(req, res, next);

      expect(accountRepository.getOrganizations).toHaveBeenCalledWith({
        userId: 'userId',
        search: '',
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if an error occurs', async () => {
      const req = {
        userId: 'userId',
        query: { page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {} as Response;
      const next = vi.fn();
      vi.spyOn(accountRepository, 'getOrganizations').mockRejectedValue(
        new Error('Error'),
      );

      await controller.getOrganizations(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error('Error'));
    });
  });

  describe('getUsers', () => {
    it('should call accountRepository.getUsers with correct parameters', async () => {
      const req = {
        userId: 'userId',
        query: { search: '', page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getUsers(req, res, next);

      expect(accountRepository.getUsers).toHaveBeenCalledWith({
        userId: 'userId',
        search: '',
        page: 1,
        limit: 10,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with error if an error occurs', async () => {
      const req = {
        userId: 'userId',
        query: { page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {} as Response;
      const next = vi.fn();
      vi.spyOn(accountRepository, 'getUsers').mockRejectedValue(
        new Error('Error'),
      );

      await controller.getUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error('Error'));
    });
  });
});
