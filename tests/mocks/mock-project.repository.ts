import { Repository } from '@prisma/client';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from 'src/github/interfaces/record-filters';

export class MockProjectRepository implements ProjectRepository {
  saveRepository = vi
    .fn()
    .mockImplementation((repository: Repository): Promise<Repository> => {
      return Promise.resolve(repository);
    });

  saveRepositories = vi
    .fn()
    .mockImplementation((repositories: Repository[]): Promise<void> => {
      return Promise.resolve(undefined);
    });

  getPaginatedRepositories = vi
    .fn()
    .mockImplementation(
      (options: RepositoryFilters): Promise<PaginatedResponse<Repository>> => {
        return Promise.resolve({
          data: [],
          total: 0,
          page: 1,
          totalPages: 0,
        });
      },
    );

  getRepositoriesByIds = vi
    .fn()
    .mockImplementation((ids: string[]): Promise<Repository[]> => {
      return Promise.resolve([]);
    });

  deleteRepositories = vi
    .fn()
    .mockImplementation((ids: string[]): Promise<void> => {
      return Promise.resolve(undefined);
    });

  deleteRepository = vi.fn().mockImplementation((id: string): Promise<void> => {
    return Promise.resolve(undefined);
  });

  renameRepository = vi
    .fn()
    .mockImplementation((id: string, name: string): Promise<Repository> => {
      return Promise.resolve({
        id,
        name,
        ownerId: 'ownerId',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Repository);
    });
}
