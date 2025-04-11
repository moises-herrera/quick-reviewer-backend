import { Account } from '@prisma/client';
import { AccountData } from 'src/github/interfaces/account-data';
import { AccountMapper } from 'src/github/mappers/account.mapper';

describe('AccountMapper', () => {
  it('should map account data to Account entity', () => {
    const accountData = {
      id: 123,
      login: 'testuser',
      type: 'User',
    } as AccountData;

    const expectedAccount: Account = {
      id: '123',
      name: 'testuser',
      type: 'User',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };

    const result = AccountMapper.mapToCreation(accountData);

    expect(result).toEqual(expectedAccount);
  });
});
