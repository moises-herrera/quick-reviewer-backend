import { TestAccount } from '@prisma/client';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { TestAccountRepository } from 'src/common/database/abstracts/test-account.repository';
import { HistoryService } from 'src/common/abstracts/history.abstract';
import { InstallationHandler } from 'src/github/event-handlers/installation.handler';
import { InstallationEvent } from 'src/github/interfaces/events';
import { AccountMapper } from 'src/github/mappers/account.mapper';
import { RepositoryMapper } from 'src/github/mappers/repository.mapper';
import { MockAccountRepository } from 'tests/mocks/repositories/mock-account.repository';
import { MockTestAccountRepository } from 'tests/mocks/repositories/mock-test-account.repository';
import { MockLoggerService } from 'tests/mocks/services/mock-logger.service';

describe('InstallationHandler', () => {
  let handler: InstallationHandler;
  let accountRepository: AccountRepository;
  let testAccountRepository: TestAccountRepository;
  let historyService: HistoryService;
  let loggerService: LoggerService;
  let event: InstallationEvent;

  beforeEach(() => {
    accountRepository = new MockAccountRepository();
    testAccountRepository = new MockTestAccountRepository();
    historyService = {
      setGitProvider: vi.fn(),
      recordHistory: vi.fn(),
    } as unknown as HistoryService;
    loggerService = new MockLoggerService();
    event = {
      payload: {
        action: 'created',
        installation: {
          id: 123,
          account: {
            id: 1,
            name: 'Test Account',
            email: null,
            login: 'test-account',
            avatar_url: 'https://example.com/avatar.png',
            type: 'User',
          },
          repositories: [],
        },
      },
      octokit: {
        rest: {
          search: {
            issuesAndPullRequests: vi.fn(),
          },
          pulls: {
            get: vi.fn(),
            listReviews: vi.fn(),
          },
        },
      },
    } as unknown as InstallationEvent;
    handler = new InstallationHandler(
      event,
      accountRepository,
      testAccountRepository,
      historyService,
      loggerService,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should set the git provider in history service', () => {
    expect(historyService.setGitProvider).toHaveBeenCalledWith(event.octokit);
  });

  describe('handle', () => {
    describe('when action is created', () => {
      it('should handle app creation', async () => {
        const accountExpected = {
          id: '1',
          name: 'test-account',
          type: 'User',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          repositories: [],
        };

        const spyMapManyToCreation = vi.spyOn(
          RepositoryMapper,
          'mapManyToCreation',
        );
        const spyMapToCreation = vi.spyOn(AccountMapper, 'mapToCreation');

        await handler.handle();

        expect(spyMapManyToCreation).toHaveBeenCalledWith([]);
        expect(spyMapToCreation).toHaveBeenCalledWith(
          event.payload.installation.account,
        );
        expect(accountRepository.saveAccount).toHaveBeenCalledWith(
          accountExpected,
        );
        expect(
          testAccountRepository.findTestAccountByName,
        ).toHaveBeenCalledWith(accountExpected.name);
      });

      it('should call recordHistory if account is a test account', async () => {
        vi.spyOn(
          testAccountRepository,
          'findTestAccountByName',
        ).mockResolvedValue({} as TestAccount);

        await handler.handle();

        expect(historyService.recordHistory).toHaveBeenCalledWith(
          'test-account',
          [],
        );
      });

      it('should call logException if an error occurs', async () => {
        const error = new Error('Test error');
        vi.spyOn(accountRepository, 'saveAccount').mockRejectedValueOnce(error);
        const spyLogException = vi.spyOn(loggerService, 'logException');

        await handler.handle();

        expect(spyLogException).toHaveBeenCalledWith(error, {
          message: 'Error creating account',
        });
      });

      it('should not handle app creation if account is not present', async () => {
        event.payload.installation.account = null;

        await handler.handle();

        expect(accountRepository.saveAccount).not.toHaveBeenCalled();
        expect(
          testAccountRepository.findTestAccountByName,
        ).not.toHaveBeenCalled();
        expect(historyService.recordHistory).not.toHaveBeenCalled();
      });
    });

    describe('when action is deleted', () => {
      beforeEach(() => {
        event.payload.action = 'deleted';
      });

      it('should handle app deletion', async () => {
        await handler.handle();

        expect(accountRepository.deleteAccount).toHaveBeenCalledWith(
          event.payload.installation.account!.id.toString(),
        );
      });

      it('should call logException if an error occurs', async () => {
        const error = new Error('Test error');
        vi.spyOn(accountRepository, 'deleteAccount').mockRejectedValueOnce(error);
        const spyLogException = vi.spyOn(loggerService, 'logException');

        await handler.handle();

        expect(spyLogException).toHaveBeenCalledWith(error, {
          message: 'Error deleting account',
        });
      });

      it('should not handle app deletion if account is not present', async () => {
        event.payload.installation.account = null;

        await handler.handle();

        expect(accountRepository.deleteAccount).not.toHaveBeenCalled();
      });
    });
  });
});
