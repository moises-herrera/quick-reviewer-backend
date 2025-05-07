import { Repository } from '@prisma/client';
import { LoggerService } from 'src/common/abstracts/logger.abstract';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { InstallationRepositoriesHandler } from 'src/github/event-handlers/installation-repositories.handler';
import { InstallationRepositoriesEvent } from 'src/github/interfaces/events';
import { MockProjectRepository } from 'tests/mocks/repositories/mock-project.repository';
import { MockLoggerService } from 'tests/mocks/services/mock-logger.service';

describe('InstallationRepositoriesHandler', () => {
  let handler: InstallationRepositoriesHandler;
  let projectRepository: ProjectRepository;
  let loggerService: LoggerService;
  let event: InstallationRepositoriesEvent;

  beforeEach(() => {
    projectRepository = new MockProjectRepository();
    loggerService = new MockLoggerService();
    event = {
      payload: {
        action: 'added',
        installation: {
          account: { id: 123 },
        },
        repositories_added: [
          {
            id: 1,
            full_name: 'test/test-repo',
            name: 'test-repo',
            node_id: 'node_id_1',
            private: false,
          },
        ],
        repositories_removed: [],
      },
    } as unknown as InstallationRepositoriesEvent;
    handler = new InstallationRepositoriesHandler(
      event,
      projectRepository,
      loggerService,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('handle', () => {
    describe('when action is "added"', () => {
      it('should save the added repositories', async () => {
        await handler.handle();

        expect(projectRepository.saveRepositories).toHaveBeenCalledWith([
          {
            id: '1',
            name: 'test-repo',
            ownerId: '123',
          },
        ]);
      });

      it('should not save repositories if none are added', async () => {
        event.payload.repositories_added = [];

        await handler.handle();

        expect(projectRepository.saveRepositories).not.toHaveBeenCalled();
      });

      it('should log an exception if saving repositories fails', async () => {
        const error = new Error('Database error');
        vi.spyOn(projectRepository, 'saveRepositories').mockRejectedValue(
          error,
        );
        const spyLogException = vi.spyOn(loggerService, 'logException');

        await handler.handle();

        expect(spyLogException).toHaveBeenCalledWith(error, {
          message: 'Error saving repositories',
        });
      });
    });

    describe('when action is "removed"', () => {
      it('should delete the removed repositories', async () => {
        vi.spyOn(
          projectRepository,
          'getRepositoriesByIds',
        ).mockResolvedValueOnce([
          {
            id: '2',
            name: 'test-repo-2',
            ownerId: '123',
          } as unknown as Repository,
        ]);

        event.payload.action = 'removed';
        event.payload.repositories_removed = [
          {
            id: 2,
            node_id: 'node_id_2',
            name: 'test-repo-2',
            full_name: 'test/test-repo-2',
            private: false,
          },
        ];

        await handler.handle();

        expect(projectRepository.deleteRepositories).toHaveBeenCalledWith([
          '2',
        ]);
      });

      it('should not delete repositories if none are removed', async () => {
        event.payload.action = 'removed';
        event.payload.repositories_removed = [];

        await handler.handle();

        expect(projectRepository.deleteRepositories).not.toHaveBeenCalled();
      });

      it('should log an exception if deleting repositories fails', async () => {
        const error = new Error('Database error');
        event.payload.action = 'removed';
        event.payload.repositories_removed = [
          {
            id: 2,
            node_id: 'node_id_2',
            name: 'test-repo-2',
            full_name: 'test/test-repo-2',
            private: false,
          },
        ];
        vi.spyOn(projectRepository, 'deleteRepositories').mockRejectedValue(
          error,
        );
        const spyLogException = vi.spyOn(loggerService, 'logException');

        await handler.handle();

        expect(spyLogException).toHaveBeenCalledWith(error, {
          message: 'Error deleting repositories',
        });
      });
    });
  });
});
