import {
  User,
  UserAccount,
  UserRepository as RepositoryWithAccess,
} from '@prisma/client';
import { UserRepository } from 'src/common/database/abstracts/user.repository';

export class MockUserRepository implements UserRepository {
  getUserById = vi
    .fn()
    .mockImplementation((id: string) => Promise.resolve({ id }));

  saveUser = vi.fn().mockImplementation((user: User) => Promise.resolve(user));

  saveUserAccounts = vi
    .fn()
    .mockImplementation((data: { userId: string; accountId: string }[]) =>
      Promise.resolve(),
    );

  saveUserRepositories = vi
    .fn()
    .mockImplementation((data: { userId: string; repositoryId: string }[]) =>
      Promise.resolve(),
    );

  getUserAccount = vi.fn(
    (userId: string, accountId: string): Promise<UserAccount | null> => {
      return Promise.resolve(null);
    },
  );

  getUserRepository = vi.fn(
    (
      userId: string,
      repositoryId: string,
    ): Promise<RepositoryWithAccess | null> => {
      return Promise.resolve(null);
    },
  );
}
