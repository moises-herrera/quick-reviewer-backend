/* eslint-disable @typescript-eslint/no-explicit-any */
import { InstallationRepositoriesHandler } from 'src/github/event-handlers/installation-repositories.handler';
import { InstallationHandler } from 'src/github/event-handlers/installation.handler';
import {
  EventHandlerFactory,
  EventTypeMap,
} from 'src/github/factories/event-handler-factory';
import { Repositories, Services } from 'src/github/factories/utils';

const mockRepositories = {
  accountRepository: {},
  projectRepository: {},
  pullRequestRepository: {},
  pullRequestCommentRepository: {},
  codeReviewRepository: {},
  codeReviewCommentRepository: {},
  testAccountRepository: {},
} as unknown as Repositories;

const mockServices = {
  historyService: {},
  aiReviewService: {
    setGitProvider: vi.fn(),
  },
  loggerService: {},
} as unknown as Services;

describe('EventHandlerFactory', () => {
  let factory: EventHandlerFactory;

  beforeEach(() => {
    factory = new EventHandlerFactory(mockRepositories, mockServices);
  });

  describe('createHandler', () => {
    it('should create an InstallationHandler for installation event', () => {
      const event = {
        type: 'installation' as keyof EventTypeMap,
        payload: {} as EventTypeMap['installation'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe(InstallationHandler.name);
    });

    it('should create an InstallationRepositoriesHandler for installation_repositories event', () => {
      const event = {
        type: 'installation_repositories' as keyof EventTypeMap,
        payload: {} as EventTypeMap['installation_repositories'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe(
        InstallationRepositoriesHandler.name,
      );
    });

    it('should create an RepositoryHandler for repository event', () => {
      const event = {
        type: 'repository' as keyof EventTypeMap,
        payload: {} as EventTypeMap['repository'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe('RepositoryHandler');
    });

    it('should create an PullRequestHandler for pull_request event', () => {
      const event = {
        type: 'pull_request' as keyof EventTypeMap,
        payload: {} as EventTypeMap['pull_request'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe('PullRequestHandler');
    });

    it('should create an IssueCommentHandler for issue_comment event', () => {
      const event = {
        type: 'issue_comment' as keyof EventTypeMap,
        payload: {} as EventTypeMap['issue_comment'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe('IssueCommentHandler');
    });

    it('should create an PullRequestReviewHandler for pull_request_review event', () => {
      const event = {
        type: 'pull_request_review' as keyof EventTypeMap,
        payload: {} as EventTypeMap['pull_request_review'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe(
        'PullRequestReviewHandler',
      );
    });

    it('should create an PullRequestReviewCommentHandler for pull_request_review_comment event', () => {
      const event = {
        type: 'pull_request_review_comment' as keyof EventTypeMap,
        payload: {} as EventTypeMap['pull_request_review_comment'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe(
        'PullRequestReviewCommentHandler',
      );
    });

    it('should create an PullRequestReviewThreadHandler for pull_request_review_thread event', () => {
      const event = {
        type: 'pull_request_review_thread' as keyof EventTypeMap,
        payload: {} as EventTypeMap['pull_request_review_thread'],
      };
      const handler = factory.createHandler(event.type, event.payload);
      expect((handler as any).constructor.name).toBe(
        'PullRequestReviewThreadHandler',
      );
    });

    it('should throw an error for unsupported event type', () => {
      const event = {
        type: 'unsupported_event' as keyof EventTypeMap,
        payload: {} as EventTypeMap[keyof EventTypeMap],
      };
      expect(() => factory.createHandler(event.type, event.payload)).toThrow(
        Error,
      );
    });

    it('should throw an error for missing event type', () => {
      const event = {
        type: undefined as unknown as keyof EventTypeMap,
        payload: {} as EventTypeMap['installation'],
      };
      expect(() => factory.createHandler(event.type, event.payload)).toThrow(
        Error,
      );
    });
  });
});
