import { Repository } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export abstract class HistoryService {
  abstract setGitProvider(gitProvider: unknown): void;
  abstract recordHistory(
    owner: string,
    repositories: Repository[],
  ): Promise<void>;
}
