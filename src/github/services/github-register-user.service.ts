import { Octokit } from '@octokit/rest';
import { User } from '@prisma/client';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { UserRepository } from 'src/core/repositories/user-repository.interface';
import { RegisterUserService } from 'src/core/services/register-user.service';
import { AccountRepository } from 'src/core/repositories/account.repository';
import { ProjectRepository } from 'src/core/repositories/project.repository';

@injectable()
export class GitHubRegisterUserService implements RegisterUserService {
  private octokit?: Octokit;

  constructor(
    @inject(UserRepository)
    private readonly userService: UserRepository,
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
      return this.userService.saveUser(user);
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
        user.id as unknown as number,
        ...accounts.map(({ organization }) => organization.id),
      ]);

      if (!existingAccounts.length) return;

      const accountIds = existingAccounts.map((account) => ({
        userId: user.id,
        accountId: account.id,
      }));

      await this.userService.saveUserAccounts(accountIds);
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

      const existingRepositories =
        await this.projectRepository.getRepositoriesByIds(
          repositories.map(({ id }) => id),
        );

      if (!existingRepositories.length) return;

      const repositoryIds = existingRepositories.map((repository) => ({
        userId: user.id,
        repositoryId: repository.id,
      }));

      await this.userService.saveUserRepositories(repositoryIds);
    } catch (error) {
      throw new HttpException(
        'Error saving user repositories',
        StatusCodes.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
