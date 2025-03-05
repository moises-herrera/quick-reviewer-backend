import { TestAccount } from '@prisma/client';

export const testAccounts: TestAccount[] = [
  {
    id: 1n,
    name: 'rithmXO',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2n,
    name: 'moises-herrera',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
