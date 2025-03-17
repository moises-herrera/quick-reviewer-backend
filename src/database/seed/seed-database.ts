import { container } from 'src/config/container-config';
import { TestAccountRepository } from 'src/core/repositories/test-account.repository';
import { testAccounts } from 'src/database/seed/data/test-accounts';
import { DbClient } from '../db-client';

const dbClient = container.get(DbClient);
const testAccountRepository = container.get(TestAccountRepository);

const deleteTestAccounts = async () => {
  await testAccountRepository.deleteAllTestAccounts();
};

const createTestAccounts = async () => {
  await testAccountRepository.saveTestAccounts(testAccounts);
};

const seedDatabase = async () => {
  await deleteTestAccounts();
  await createTestAccounts();
};

seedDatabase()
  .then(() => {
    console.log('Database seeded successfully');
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
  })
  .finally(async () => {
    await dbClient.$disconnect();
  });
