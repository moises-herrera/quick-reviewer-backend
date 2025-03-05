import { Octokit } from '@octokit/rest';
import { User } from '@prisma/client';
import { prisma } from 'src/database/db-connection';
import { UserService } from './user.service';
import { HttpException } from 'src/common/exceptions/http-exception';
import { StatusCodes } from 'http-status-codes';

export class RegisterUserService {
  private readonly userService = new UserService();

  constructor(private readonly octokit: Octokit) {}

  async registerUserData(): Promise<void> {
    const user = await this.registerGitHubUser();
    await this.registerGitHubAccounts(user);
    await this.registerGitHubRepositories(user);
  }

  async registerGitHubUser(): Promise<User> {
    try {
      const { data: user } = await this.octokit.request('GET /user');

      const userData: User = {
        id: user.id as unknown as bigint,
        name: user.name,
        username: user.login,
        email: user.notification_email ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return this.userService.saveUser(userData);
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
      const { data: repositories } =
        await this.octokit.request('GET /user/repos');

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
