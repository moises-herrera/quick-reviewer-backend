import { Account, Repository } from '@prisma/client';

export interface AccountWithRepositories extends Account {
  repositories: Omit<Repository, 'ownerId'>[];
}
