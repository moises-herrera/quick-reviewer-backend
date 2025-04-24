export class MockDbClient {
  account = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  };

  repository = {
    createMany: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    delete: vi.fn(),
  };

  pullRequest = {
    create: vi.fn(),
    createMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  };

  pullRequestComment = {
    create: vi.fn(),
    createMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };

  codeReview = {
    create: vi.fn(),
    createMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  };

  codeReviewComment = {
    create: vi.fn(),
    createMany: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };

  user = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };

  userAccount = {
    createMany: vi.fn(),
    findMany: vi.fn(),
  };

  userRepository = {
    createMany: vi.fn(),
    findMany: vi.fn(),
  };

  testAccount = {
    createMany: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
  };

  accountSettings = {
    findFirst: vi.fn(),
    upsert: vi.fn(),
  };

  repositorySettings = {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  }

  connectToDatabase = vi.fn();
}
