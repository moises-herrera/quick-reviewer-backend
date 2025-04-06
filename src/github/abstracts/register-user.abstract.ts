import { User } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class RegisterUserService {
  abstract setGitProvider(gitProvider: unknown): void;
  abstract registerUserData(user: User): Promise<void>;
  abstract registerHistory(user: User): Promise<void>;
}
