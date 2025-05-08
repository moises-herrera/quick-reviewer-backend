import { Octokit } from '@octokit/rest';
import { Account, Repository, User } from '@prisma/client';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { GitHubRegisterUserService } from 'src/github/services/github-register-user.service';
import { MockAccountRepository } from 'tests/mocks/repositories/mock-account.repository';
import { MockProjectRepository } from 'tests/mocks/repositories/mock-project.repository';
import { MockUserRepository } from 'tests/mocks/repositories/mock-user.repository';

describe('GitHubRegisterUserService', () => {
  let service: GitHubRegisterUserService;
  let userRepository: UserRepository;
  let accountRepository: AccountRepository;
  let projectRepository: ProjectRepository;
  const mockOctokit = {
    request: vi.fn().mockImplementation((url) => {
      if (url === 'GET /user/memberships/orgs') {
        return Promise.resolve({
          data: [{ organization: { id: 123 } }, { organization: { id: 456 } }],
        });
      }
      if (url === 'GET /user/repos') {
        return Promise.resolve({
          data: [
            { id: 789, owner: { id: 3 } },
            { id: 452, owner: { id: 4 } },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    }),
  } as unknown as Octokit;

  const user: User = {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@email.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    userRepository = new MockUserRepository();
    accountRepository = new MockAccountRepository();
    projectRepository = new MockProjectRepository();
    service = new GitHubRegisterUserService(
      userRepository,
      accountRepository,
      projectRepository,
    );

    service.setGitProvider(mockOctokit);
  });

  describe('registerUserData', () => {
    it('should save user data and register history', async () => {
      const spySaveUser = vi.spyOn(userRepository, 'saveUser');
      const spyRegisterHistory = vi.spyOn(service, 'registerHistory');

      await service.registerUserData(user);

      expect(spySaveUser).toHaveBeenCalledWith(user);
      expect(spyRegisterHistory).toHaveBeenCalledWith(user);
    });

    it('should throw error if saving user fails', async () => {
      vi.spyOn(userRepository, 'saveUser').mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.registerUserData(user)).rejects.toThrowError(Error);
    });
  });

  describe('registerHistory', () => {
    it('should register accounts and repositories', async () => {
      const spyOctokitRequest = vi.spyOn(mockOctokit, 'request');
      const spyGetAccountsByIds = vi
        .spyOn(accountRepository, 'getAccountsByIds')
        .mockResolvedValue([
          { id: user.id },
          { id: '123' },
          { id: '456' },
        ] as Account[]);
      const spySaveUserAccounts = vi.spyOn(userRepository, 'saveUserAccounts');

      await service.registerHistory(user);

      expect(spyOctokitRequest).toHaveBeenCalledWith(
        'GET /user/memberships/orgs',
      );
      expect(spyGetAccountsByIds).toHaveBeenCalledWith([user.id, '123', '456']);
      expect(spySaveUserAccounts).toHaveBeenCalledWith([
        { userId: user.id, accountId: user.id, canConfigureBot: false },
        { userId: user.id, accountId: '123', canConfigureBot: false },
        { userId: user.id, accountId: '456', canConfigureBot: false },
      ]);
    });

    it('should throw error if octokit is not initialized', async () => {
      service.setGitProvider(undefined as unknown as Octokit);

      await expect(service.registerHistory(user)).rejects.toThrowError(
        'Octokit is not initialized',
      );
    });

    it('should throw error if saving user accounts fails', async () => {
      vi.spyOn(accountRepository, 'getAccountsByIds').mockResolvedValue([
        { id: user.id },
        { id: '123' },
        { id: '456' },
      ] as Account[]);
      vi.spyOn(userRepository, 'saveUserAccounts').mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(service.registerHistory(user)).rejects.toThrowError(
        'Error saving user accounts',
      );
    });

    it('should register repositories', async () => {
      const spyOctokitRequest = vi.spyOn(mockOctokit, 'request');
      const spyGetRepositoriesByIds = vi
        .spyOn(projectRepository, 'getRepositoriesByIds')
        .mockResolvedValue([{ id: '789' }, { id: '452' }] as Repository[]);
      const spySaveUserRepositories = vi.spyOn(
        userRepository,
        'saveUserRepositories',
      );

      await service.registerHistory(user);

      expect(spyOctokitRequest).toHaveBeenCalledWith('GET /user/repos', {
        affiliation: 'owner,collaborator,organization_member',
        per_page: 100,
        page: 1,
      });
      expect(spyGetRepositoriesByIds).toHaveBeenCalledWith(['789', '452']);
      expect(spySaveUserRepositories).toHaveBeenCalledWith([
        { userId: user.id, repositoryId: '789', canConfigureBot: false },
        { userId: user.id, repositoryId: '452', canConfigureBot: false },
      ]);
    });

    it('should throw error if saving user repositories fails', async () => {
      vi.spyOn(projectRepository, 'getRepositoriesByIds').mockResolvedValue([
        { id: '789' },
        { id: '452' },
      ] as Repository[]);
      vi.spyOn(userRepository, 'saveUserRepositories').mockRejectedValue(
        new Error('Error saving user data'),
      );

      await expect(service.registerHistory(user)).rejects.toThrowError(Error);
    });
  });
});
