import { Octokit } from '@octokit/rest';
import { User } from '@prisma/client';
import { prisma } from 'src/database/db-connection';
import { UserService } from './user.service';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';

export class RegisterUserService {
  private readonly userService = new UserService();

  constructor(private readonly octokit: Octokit) {}

  async registerUserData(user: User): Promise<void> {
    await this.registerGitHubUser(user);
    await this.registerHistory(user);
  }

  async registerHistory(user: User): Promise<void> {
    await this.registerGitHubAccounts(user);
    await this.registerGitHubRepositories(user);
  }

  async registerGitHubUser(user: User): Promise<User> {
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

  async registerGitHubAccounts(user: User): Promise<void> {
    try {
      const { data: accounts } = await this.octokit.request(
        'GET /user/memberships/orgs',
      );

      const existingAccounts = await prisma.account.findMany({
        where: {
          id: {
            in: [
              user.id,
              ...(accounts.map(
                (account) => account.organization.id,
              ) as unknown as bigint[]),
            ],
          },
        },
      });

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

  async registerGitHubRepositories(user: User): Promise<void> {
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
      const existingRepositories = await prisma.repository.findMany({
        where: {
          id: {
            in: repositories.map((repository) => repository.id),
          },
        },
      });

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
