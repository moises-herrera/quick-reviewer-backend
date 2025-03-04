import { Repository } from '@prisma/client';
import { RepositoryData } from '../interfaces/repository-data';

export const mapRepositoryToCreation = (
  repository: RepositoryData,
): Repository => {
  return {
    id: repository.node_id,
    name: repository.name,
  } as Repository;
};

export const mapRepositoriesToCreation = (
  repositories: RepositoryData[],
): Repository[] => {
  return repositories.map((data) => mapRepositoryToCreation(data));
};
