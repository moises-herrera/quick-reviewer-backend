import { prisma } from 'src/database/db-connection';
import { testAccounts } from 'src/database/seed/data/test-accounts';

const deleteTestAccounts = async () => {
  await prisma.testAccount.deleteMany({});
};

const createTestAccounts = async () => {
  await prisma.testAccount.createMany({
    data: testAccounts,
  });
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
    await prisma.$disconnect();
  });
