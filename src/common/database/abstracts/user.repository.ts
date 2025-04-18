import {
  User,
  UserAccount,
  UserRepository as RepositoryWithAccess,
} from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class UserRepository {
  abstract getUserById(id: string): Promise<User | null>;
  abstract saveUser(data: User): Promise<User>;
  abstract saveUserAccounts(data: Partial<UserAccount>[]): Promise<void>;
  abstract saveUserRepositories(
    data: Partial<RepositoryWithAccess>[],
  ): Promise<void>;
}
