import { User } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class UserRepository {
  abstract getUserById(id: string): Promise<User | null>;
  abstract saveUser(data: User): Promise<User>;
  abstract saveUserAccounts(
    data: { userId: string; accountId: string }[],
  ): Promise<void>;
  abstract saveUserRepositories(
    data: { userId: string; repositoryId: string }[],
  ): Promise<void>;
}
