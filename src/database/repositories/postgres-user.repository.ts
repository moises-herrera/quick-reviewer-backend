import { User } from '@prisma/client';
import { injectable } from 'inversify';
import { prisma } from 'src/database/db-connection';

@injectable()
export class PostgresUserRepository {
  async getUserById(id: bigint): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async saveUser(data: User): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: data.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const user = await prisma.user.create({
      data,
    });

    return user;
  }

  async saveUserAccounts(
    data: {
      userId: bigint;
      accountId: bigint;
    }[],
  ): Promise<void> {
    const existingUserAccounts = await prisma.userAccount.findMany({
      where: {
        userId: data[0].userId as unknown as bigint,
      },
    });

    const filteredData = data.filter(
      (item) =>
        !existingUserAccounts.some(
          ({ accountId }) => item.accountId === accountId,
        ),
    );

    await prisma.userAccount.createMany({
      data: filteredData,
    });
  }

  async saveUserRepositories(
    data: {
      userId: bigint;
      repositoryId: bigint;
    }[],
  ): Promise<void> {
    const existingRepositories = await prisma.userRepository.findMany({
      where: {
        userId: data[0].userId as unknown as bigint,
      },
    });
    const filteredData = data.filter(
      (item) =>
        !existingRepositories.some(
          ({ repositoryId }) => item.repositoryId === repositoryId,
        ),
    );

    await prisma.userRepository.createMany({
      data: filteredData,
    });
  }
}
