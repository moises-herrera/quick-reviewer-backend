import { TestAccount } from '@prisma/client';

export const testAccounts: TestAccount[] = [
  {
    id: 1 as unknown as bigint,
    name: 'rithmXO',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2 as unknown as bigint,
    name: 'moises-herrera',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
