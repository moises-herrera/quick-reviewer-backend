import { Repository } from '@prisma/client';
import { injectable } from 'inversify';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from 'src/core/interfaces/record-filters';

@injectable()
export abstract class ProjectRepository {
  abstract saveRepositories(repositories: Repository[]): Promise<void>;
  abstract saveRepository(repository: Repository): Promise<void>;
  abstract getPaginatedRepositories(
    options: RepositoryFilters,
  ): Promise<PaginatedResponse<Repository>>;
  abstract getRepositoriesByIds(ids: string[]): Promise<Repository[]>;
  abstract deleteRepositories(ids: string[]): Promise<void>;
  abstract deleteRepository(id: string): Promise<void>;
  abstract renameRepository(id: string, name: string): Promise<void>;
}
