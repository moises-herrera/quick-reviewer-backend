import { RepositoryData } from 'src/github/interfaces/repository-data';
import { RepositoryMapper } from 'src/github/mappers/repository.mapper';

describe('RepositoryMapper', () => {
  it('should map repository data to Repository entity', () => {
    const repositoryData: RepositoryData = {
      id: 456,
      name: 'testrepo',
      full_name: 'testuser/testrepo',
      private: false,
    };

    const expectedRepository = {
      id: '456',
      name: 'testrepo',
    };

    const result = RepositoryMapper.mapToCreation(repositoryData);

    expect(result).toEqual(expectedRepository);
  });

  it('should map multiple repository data to Repository entities', () => {
    const repositoriesData: RepositoryData[] = [
      {
        id: 456,
        name: 'testrepo1',
        full_name: 'testuser/testrepo1',
        private: false,
      },
      {
        id: 789,
        name: 'testrepo2',
        full_name: 'testuser/testrepo2',
        private: true,
      },
    ];

    const expectedRepositories = [
      {
        id: '456',
        name: 'testrepo1',
      },
      {
        id: '789',
        name: 'testrepo2',
      },
    ];

    const result = RepositoryMapper.mapManyToCreation(repositoriesData);

    expect(result).toEqual(expectedRepositories);
  });
});
