import http from 'node:http';
import { startServer } from 'src/index';
import { MockLoggerService } from 'tests/mocks/services/mock-logger.service';

const mockApp = {
  get: vi.fn(() => 3000),
};

const mockLogger = new MockLoggerService();

const mockServer = vi.hoisted(() => ({
  listen: vi.fn((_port, callback) => {
    callback();
  }),
}));

vi.mock('node:http', () => {
  return {
    default: {
      createServer: vi.fn().mockReturnValue(mockServer),
    },
    createServer: vi.fn().mockReturnValue(mockServer),
  };
});

vi.mock('src/app', () => ({
  createApp: vi.fn(() => mockApp),
}));

vi.mock('src/app/config/container-config', () => ({
  container: {
    get: vi.fn(() => mockLogger),
  },
}));

describe('Server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start the server', () => {
    const spyLog = vi.spyOn(mockLogger, 'log');

    startServer();

    expect(http.createServer).toHaveBeenCalledWith(mockApp);
    expect(mockServer.listen).toHaveBeenCalledWith(3000, expect.any(Function));
    expect(spyLog).toHaveBeenCalledWith('Server is running on port 3000');
  });
});
