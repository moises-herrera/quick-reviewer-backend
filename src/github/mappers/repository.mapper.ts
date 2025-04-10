import { Repository } from '@prisma/client';
import { RepositoryData } from 'src/github/interfaces/repository-data';

export class RepositoryMapper {
  static mapToCreation(repository: RepositoryData): Repository {
    return {
      id: repository.id.toString(),
      name: repository.name,
    } as Repository;
  }

  static mapManyToCreation(repositories: RepositoryData[]): Repository[] {
    return repositories.map((data) => this.mapToCreation(data));
  }
}
