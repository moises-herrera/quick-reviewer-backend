import { Repository } from '@prisma/client';
import { prisma } from 'src/database/db-connection';

export class RepositoryService {
  async saveRepositories(repositories: Repository[]): Promise<void> {
    await prisma.repository.createMany({
      data: repositories,
    });
  }

  async saveRepository(repository: Repository): Promise<void> {
    await prisma.repository.create({
      data: repository,
    });
  }

  async deleteRepositories(ids: number[]): Promise<void> {
    await prisma.repository.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async deleteRepository(id: number): Promise<void> {
    await prisma.repository.delete({
      where: {
        id,
      },
    });
  }

  async renameRepository(id: number, name: string): Promise<void> {
    await prisma.repository.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
  }
}
