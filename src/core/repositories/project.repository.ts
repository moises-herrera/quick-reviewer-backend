import { Repository } from '@prisma/client';
import { injectable } from 'inversify';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { RepositoryFilters } from 'src/core/interfaces/record-filters';

@injectable()
export abstract class ProjectRepository {
  abstract saveRepositories(repositories: Repository[]): Promise<void>;
  abstract saveRepository(repository: Repository): Promise<void>;
  abstract getRepositories(
    options: RepositoryFilters,
  ): Promise<PaginatedResponse<Repository>>;
  abstract deleteRepositories(ids: number[]): Promise<void>;
  abstract deleteRepository(id: number): Promise<void>;
  abstract renameRepository(id: number, name: string): Promise<void>;
}
