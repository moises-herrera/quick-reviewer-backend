import { User } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { DbClient } from 'src/common/database/db-client';

@injectable()
export class PostgresUserRepository {
  constructor(@inject(DbClient) private readonly dbClient: DbClient) {}

  async getUserById(id: string): Promise<User | null> {
    const user = await this.dbClient.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async saveUser(data: User): Promise<User> {
    const existingUser = await this.dbClient.user.findUnique({
      where: {
        id: data.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const user = await this.dbClient.user.create({
      data,
    });

    return user;
  }

  async saveUserAccounts(
    data: {
      userId: string;
      accountId: string;
    }[],
  ): Promise<void> {
    const existingUserAccounts = await this.dbClient.userAccount.findMany({
      where: {
        userId: data[0].userId,
      },
    });

    const filteredData = data.filter(
      (item) =>
        !existingUserAccounts.some(
          ({ accountId }) => item.accountId === accountId,
        ),
    );

    await this.dbClient.userAccount.createMany({
      data: filteredData,
    });
  }

  async saveUserRepositories(
    data: {
      userId: string;
      repositoryId: string;
    }[],
  ): Promise<void> {
    const existingRepositories = await this.dbClient.userRepository.findMany({
      where: {
        userId: data[0].userId,
      },
    });
    const filteredData = data.filter(
      (item) =>
        !existingRepositories.some(
          ({ repositoryId }) => item.repositoryId === repositoryId,
        ),
    );

    await this.dbClient.userRepository.createMany({
      data: filteredData,
    });
  }
}
