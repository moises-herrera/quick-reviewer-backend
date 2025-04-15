import { User } from '@prisma/client';
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
}
