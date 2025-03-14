import { User } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class UserRepository {
  abstract getUserById(id: bigint): Promise<User | null>;
  abstract saveUser(data: User): Promise<User>;
  abstract saveUserAccounts(
    data: { userId: bigint; accountId: bigint }[],
  ): Promise<void>;
  abstract saveUserRepositories(
    data: { userId: bigint; repositoryId: bigint }[],
  ): Promise<void>;
}
