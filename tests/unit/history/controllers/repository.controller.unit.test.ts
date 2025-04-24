import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { AuthRequest } from 'src/common/interfaces/auth-request';
import { RepositoryController } from 'src/history/controllers/repository.controller';
import { MockProjectRepository } from 'tests/mocks/repositories/mock-project.repository';

describe('RepositoryController', () => {
  let controller: RepositoryController;
  let projectRepository: ProjectRepository;

  beforeEach(() => {
    projectRepository = new MockProjectRepository();
    controller = new RepositoryController(projectRepository);
  });

  describe('getRepositories', () => {
    it('should call projectRepository.getPaginatedRepositories with correct parameters', async () => {
      const req = {
        userId: 'user-id',
        params: { ownerName: 'owner-name' },
        query: { search: '', page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as unknown as Response;
      const next = vi.fn();

      await controller.getRepositories(req, res, next);

      expect(projectRepository.getPaginatedRepositories).toHaveBeenCalledWith({
        userId: 'user-id',
        ownerName: 'owner-name',
        search: '',
        page: 1,
        limit: 10,
        includeSettings: false,
      });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('should call next with an error if projectRepository.getPaginatedRepositories throws an error', async () => {
      const req = {
        userId: 'user-id',
        params: { ownerName: 'owner-name' },
        query: { search: '', page: 1, limit: 10 },
      } as unknown as AuthRequest;
      const res = {} as Response;
      const next = vi.fn();
      const error = new Error('Database error');
      vi.spyOn(projectRepository, 'getPaginatedRepositories').mockRejectedValue(
        error,
      );

      await controller.getRepositories(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
