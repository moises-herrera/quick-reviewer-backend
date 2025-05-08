import { Octokit } from '@octokit/rest';
import { User } from '@prisma/client';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { RegisterUserService } from 'src/common/abstracts/register-user.abstract';
import { AccountRepository } from 'src/common/database/abstracts/account.repository';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';

@injectable()
export class GitHubRegisterUserService implements RegisterUserService {
  private octokit?: Octokit;

  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
    @inject(AccountRepository)
    private readonly accountRepository: AccountRepository,
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  setGitProvider(octokit: Octokit): void {
    this.octokit = octokit;
  }

  async registerUserData(user: User): Promise<void> {
    await this.saveUserInfo(user);
    await this.registerHistory(user);
  }

  async registerHistory(user: User): Promise<void> {
    await this.registerAccounts(user);
    await this.registerRepositories(user);
  }

  private async saveUserInfo(user: User): Promise<User> {
    try {
      return this.userRepository.saveUser(user);
    } catch (error) {
      throw new HttpException(
        'Error saving user data',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  private async registerAccounts(user: User): Promise<void> {
    if (!this.octokit) {
      throw new HttpException(
        'Octokit is not initialized',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const { data: accounts } = await this.octokit.request(
        'GET /user/memberships/orgs',
      );

      const existingAccounts = await this.accountRepository.getAccountsByIds([
        user.id.toString(),
        ...accounts.map(({ organization }) => organization.id.toString()),
      ]);

      if (!existingAccounts.length) return;

      const accountsData = existingAccounts.map((account) => {
        const canConfigureBot =
          accounts.find(
            ({ organization }) => organization.id.toString() === account.id,
          )?.role === 'admin';

        return {
          userId: user.id,
          accountId: account.id,
          canConfigureBot,
        };
      });

      await this.userRepository.saveUserAccounts(accountsData);
    } catch (error) {
      throw new HttpException(
        'Error saving user accounts',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  private async registerRepositories(user: User): Promise<void> {
    if (!this.octokit) {
      throw new HttpException(
        'Octokit is not initialized',
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const { data: repositories } = await this.octokit.request(
        'GET /user/repos',
        {
          affiliation: 'owner,collaborator,organization_member',
          per_page: 100,
          page: 1,
        },
      );

      if (!repositories.length) return;

      const accountIds = repositories.map(({ owner }) => owner.id.toString());
      const existingAccounts =
        await this.accountRepository.getAccountsByIds(accountIds);
      const newAccountIds = accountIds.filter(
        (id) => !existingAccounts.some((account) => account.id === id),
      );

      if (newAccountIds.length) {
        const accountsData = newAccountIds.map((accountId) => {
          return {
            userId: user.id,
            accountId,
            canConfigureBot: false,
          };
        });

        await this.userRepository.saveUserAccounts(accountsData);
      }

      const existingRepositories =
        await this.projectRepository.getRepositoriesByIds(
          repositories.map(({ id }) => id.toString()),
        );

      if (!existingRepositories.length) return;

      const repositoriesData = existingRepositories.map((repository) => {
        const permissions = repositories.find(
          ({ id }) => id.toString() === repository.id,
        )?.permissions;

        return {
          userId: user.id,
          repositoryId: repository.id,
          canConfigureBot: permissions?.admin || permissions?.maintain || false,
        };
      });

      await this.userRepository.saveUserRepositories(repositoriesData);
    } catch (error) {
      throw new HttpException(
        'Error saving user repositories',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
