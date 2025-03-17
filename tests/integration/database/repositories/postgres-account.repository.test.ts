import { Account } from '@prisma/client';
import { DbClient } from 'src/database/db-client';
import 'src/common/utils/big-int-serializer';

describe('PostgresAccountRepository', () => {
  const dbClient = new DbClient();

  beforeAll(async () => {
    await dbClient.connectToDatabase();
  });

  afterAll(async () => {
    await dbClient.account.deleteMany({});
    await dbClient.$disconnect();
  });

  it('should create a new account', async () => {
    const accountData: Account = {
      id: '12345678901234567890',
      name: 'test-account',
      type: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await dbClient.account.create({ data: accountData });
    expect(result).toEqual(accountData);
  });
});
