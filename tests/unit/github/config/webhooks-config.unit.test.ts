import { registerWebhooks } from 'src/github/config/webhooks-config';

const mockWebhooks = vi.hoisted(() => ({
  on: vi.fn(),
}));

const mockGitHubApp = vi.hoisted(() => ({
  webhooks: mockWebhooks,
}));

const mockHandler = vi.hoisted(() => ({
  handle: vi.fn(),
}));

const mockFactoryHandler = vi.hoisted(() => ({
  createHandler: vi.fn(() => mockHandler),
}));

vi.mock('src/github/config/github-app', () => ({
  gitHubApp: mockGitHubApp,
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: () => mockFactoryHandler,
  },
}));

describe('GitHub Webhooks Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register webhooks correctly', () => {
    const spyOn = vi.spyOn(mockWebhooks, 'on');

    registerWebhooks();

    expect(spyOn).toHaveBeenCalledTimes(8);
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'installation',
      expect.any(Function),
    );
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'installation_repositories',
      expect.any(Function),
    );
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'repository',
      expect.any(Function),
    );
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'pull_request',
      expect.any(Function),
    );
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'issue_comment',
      expect.any(Function),
    );
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'pull_request_review',
      expect.any(Function),
    );
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'pull_request_review_comment',
      expect.any(Function),
    );
    expect(mockWebhooks.on).toHaveBeenCalledWith(
      'pull_request_review_thread',
      expect.any(Function),
    );
  });

  it('should call handler.handle() when installation webhook is triggered', async () => {
    registerWebhooks();

    const installationCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'installation')?.[1];

    await installationCallback?.({ octokit: {}, payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'installation',
      {
        octokit: {},
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should call handler.handle() when installation_repositories webhook is triggered', async () => {
    registerWebhooks();

    const installationRepositoriesCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'installation_repositories')
      ?.at(1);

    await installationRepositoriesCallback?.({ payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'installation_repositories',
      {
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should call handler.handle() when repository webhook is triggered', async () => {
    registerWebhooks();

    const repositoryCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'repository')?.[1];

    await repositoryCallback?.({ payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'repository',
      {
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should call handler.handle() when pull_request webhook is triggered', async () => {
    registerWebhooks();

    const pullRequestCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'pull_request')?.[1];

    await pullRequestCallback?.({ octokit: {}, payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'pull_request',
      {
        octokit: {},
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should call handler.handle() when issue_comment webhook is triggered', async () => {
    registerWebhooks();

    const issueCommentCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'issue_comment')?.[1];

    await issueCommentCallback?.({ octokit: {}, payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'issue_comment',
      {
        octokit: {},
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should call handler.handle() when pull_request_review webhook is triggered', async () => {
    registerWebhooks();

    const pullRequestReviewCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'pull_request_review')?.[1];

    await pullRequestReviewCallback?.({ payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'pull_request_review',
      {
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should call handler.handle() when pull_request_review_comment webhook is triggered', async () => {
    registerWebhooks();

    const pullRequestReviewCommentCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'pull_request_review_comment')
      ?.at(1);

    await pullRequestReviewCommentCallback?.({ payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'pull_request_review_comment',
      {
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should call handler.handle() when pull_request_review_thread webhook is triggered', async () => {
    registerWebhooks();

    const pullRequestReviewThreadCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'pull_request_review_thread')
      ?.at(1);

    await pullRequestReviewThreadCallback?.({ payload: {} });

    expect(mockFactoryHandler.createHandler).toHaveBeenCalledWith(
      'pull_request_review_thread',
      {
        payload: {},
      },
    );
    expect(mockHandler.handle).toHaveBeenCalled();
  });

  it('should not call handler.handle() if the event type is not recognized', async () => {
    registerWebhooks();

    const unknownCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'unknown_event')?.[1];

    await unknownCallback?.({ payload: {} });

    expect(mockFactoryHandler.createHandler).not.toHaveBeenCalled();
    expect(mockHandler.handle).not.toHaveBeenCalled();
  });

  it('should not call handler.handle() if the callback is not provided', async () => {
    registerWebhooks();

    const noCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'no_callback')?.[1];

    await noCallback?.({ payload: {} });

    expect(mockFactoryHandler.createHandler).not.toHaveBeenCalled();
    expect(mockHandler.handle).not.toHaveBeenCalled();
  });

  it('should not call handler.handle() if the payload is not provided', async () => {
    registerWebhooks();

    const noPayloadCallback = vi
      .mocked(mockWebhooks.on)
      .mock.calls.find((call) => call[0] === 'no_payload')?.[1];

    await noPayloadCallback?.({ octokit: {} });

    expect(mockFactoryHandler.createHandler).not.toHaveBeenCalled();
    expect(mockHandler.handle).not.toHaveBeenCalled();
  });
});
