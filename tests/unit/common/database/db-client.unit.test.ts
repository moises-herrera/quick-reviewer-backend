import { PrismaClient } from '@prisma/client';
import { DbClient } from 'src/common/database/db-client';
import { MockLoggerService } from 'tests/mocks/mock-logger.service';

vi.mock('src/app/config/env-config', () => ({
  envConfig: {
    DATABASE_URL: 'mocked_database_url',
  },
}));

describe('Database Client', () => {
  let dbClient: DbClient;
  let mockLoggerService: MockLoggerService;

  beforeEach(() => {
    mockLoggerService = new MockLoggerService();
    dbClient = new DbClient(mockLoggerService);
  });

  it('should be able to connect to the database', async () => {
    const spyConnect = vi
      .spyOn(PrismaClient.prototype, '$connect')
      .mockResolvedValueOnce(undefined);

    await dbClient.connectToDatabase();

    expect(spyConnect).toHaveBeenCalledTimes(1);
  });

  it('should log an error and exit the process if connection fails', async () => {
    const spyConnect = vi
      .spyOn(PrismaClient.prototype, '$connect')
      .mockRejectedValueOnce(new Error('Connection error'));

    const spyLogException = vi.spyOn(mockLoggerService, 'logException');
    const spyExit = vi.spyOn(process, 'exit').mockImplementationOnce(() => {
      return undefined as never;
    });

    await dbClient.connectToDatabase();

    expect(spyConnect).toHaveBeenCalledTimes(1);
    expect(spyLogException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        message: 'Error connecting to the database',
      }),
    );
    expect(spyExit).toHaveBeenCalledWith(1);
  });
});
