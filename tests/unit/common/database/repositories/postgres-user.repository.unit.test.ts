import { User, UserAccount, UserRepository } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { PostgresUserRepository } from 'src/common/database/repositories/postgres-user.repository';
import { MockDbClient } from 'tests/mocks/mock-db-client';

describe('PostgresUserRepository', () => {
  let dbClient: DbClient;
  let userRepository: PostgresUserRepository;

  const userId = '123';
  const user = { id: userId, name: 'John Doe' } as unknown as User;

  beforeEach(() => {
    dbClient = new MockDbClient() as unknown as DbClient;
    userRepository = new PostgresUserRepository(dbClient);
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      vi.mocked(dbClient.user.findUnique).mockResolvedValue(user);

      const result = await userRepository.getUserById(userId);

      expect(result).toEqual(user);
      expect(dbClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('saveUser', () => {
    it('should save user if not exists', async () => {
      vi.mocked(dbClient.user.findUnique).mockResolvedValue(null);
      vi.mocked(dbClient.user.create).mockResolvedValue(user);

      const result = await userRepository.saveUser(user);

      expect(result).toEqual(user);
      expect(dbClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(dbClient.user.create).toHaveBeenCalledWith({ data: user });
    });

    it('should return existing user if already exists', async () => {
      vi.mocked(dbClient.user.findUnique).mockResolvedValue(user);

      const result = await userRepository.saveUser(user);

      expect(result).toEqual(user);
      expect(dbClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(dbClient.user.create).not.toHaveBeenCalled();
    });
  });

  describe('saveUserAccounts', () => {
    it('should save user accounts if not exists', async () => {
      const userAccounts = [
        { userId: userId, accountId: 'account1' },
        { userId: userId, accountId: 'account2' },
      ] as UserAccount[];
      const existingUserAccounts = [
        { userId: userId, accountId: 'account1' },
      ] as UserAccount[];

      vi.mocked(dbClient.userAccount.findMany).mockResolvedValue(
        existingUserAccounts,
      );
      vi.mocked(dbClient.userAccount.createMany).mockResolvedValue({
        count: 1,
      });

      await userRepository.saveUserAccounts(userAccounts);

      expect(dbClient.userAccount.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(dbClient.userAccount.createMany).toHaveBeenCalledWith({
        data: [{ userId, accountId: 'account2' }],
      });
    });
  });

  describe('saveUserRepositories', () => {
    it('should save user repositories if not exists', async () => {
      const userRepositories = [
        { userId: userId, repositoryId: 'repo1' },
        { userId: userId, repositoryId: 'repo2' },
      ] as UserRepository[];
      const existingRepositories = [
        { userId: userId, repositoryId: 'repo1' },
      ] as UserRepository[];

      vi.mocked(dbClient.userRepository.findMany).mockResolvedValue(
        existingRepositories,
      );
      vi.mocked(dbClient.userRepository.createMany).mockResolvedValue({
        count: 1,
      });

      await userRepository.saveUserRepositories(userRepositories);

      expect(dbClient.userRepository.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(dbClient.userRepository.createMany).toHaveBeenCalledWith({
        data: [{ userId, repositoryId: 'repo2' }],
      });
    });
  });
});
