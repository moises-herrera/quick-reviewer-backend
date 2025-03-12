import { PullRequest } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { HttpException } from 'src/common/exceptions/http-exception';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response';
import { prisma } from 'src/database/db-connection';
import { PullRequestFilters } from '../interfaces/record-filters';
import { Octokit } from '../github-app';
import { RestEndpointMethodTypes } from '@octokit/rest';
import { isExtensionSupported } from 'src/common/utils/get-language-from-filename';

export class PullRequestService {
  async savePullRequest(data: PullRequest): Promise<void> {
    await prisma.pullRequest.create({
      data,
    });
  }

  async getPullRequestById(
    pullRequestId: number | string,
  ): Promise<PullRequest | null> {
    const pullRequest = await prisma.pullRequest.findFirst({
      where:
        typeof pullRequestId === 'string'
          ? { nodeId: pullRequestId }
          : { id: pullRequestId },
    });

    if (!pullRequest) {
      throw new HttpException('Pull request not found', StatusCodes.NOT_FOUND);
    }

    return pullRequest;
  }

  async updatePullRequest(
    id: number,
    data: Partial<PullRequest>,
  ): Promise<void> {
    await prisma.pullRequest.update({
      where: {
        id,
      },
      data,
    });
  }

  async getPullRequests(
    options: PullRequestFilters,
  ): Promise<PaginatedResponse<PullRequest>> {
    const isRepositoryId = !isNaN(Number(options.repositoryName));
    const repositoryFilter = {
      where: isRepositoryId
        ? {
            id: Number(options.repositoryName),
            users: {
              some: {
                userId: options.userId,
              },
            },
          }
        : {
            name: options.repositoryName,
            owner: {
              name: options.ownerName,
            },
            users: {
              some: {
                userId: options.userId,
              },
            },
          },
    } as const;
    const existingRepository =
      await prisma.repository.findFirst(repositoryFilter);

    if (!existingRepository) {
      throw new HttpException('Repository not found', StatusCodes.NOT_FOUND);
    }

    const skipRecords =
      options.page > 1 ? options.limit * (options.page - 1) : 0;
    const filter = {
      where: {
        repository: {
          id: existingRepository.id,
        },
        title: {
          contains: options.search,
          mode: 'insensitive',
        },
      },
    } as const;
    const pullRequests = await prisma.pullRequest.findMany({
      ...filter,
      take: options.limit,
      skip: skipRecords,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const total = await prisma.pullRequest.count(filter);

    const response: PaginatedResponse<PullRequest> = {
      data: pullRequests,
      total,
      page: options.page,
      totalPages: Math.ceil(total / options.limit),
    };

    return response;
  }

  async getFileContents(
    octokit: Octokit,
    owner: string,
    repo: string,
    changedFiles: RestEndpointMethodTypes['pulls']['listFiles']['response']['data'],
    headSha: string,
  ): Promise<{
    fileContents: Map<string, string>;
  }> {
    const fileContents = new Map<string, string>();

    for (const file of changedFiles) {
      try {
        if (
          !['removed', 'renamed', 'unchanged'].includes(file.status) &&
          isExtensionSupported(file.filename)
        ) {
          const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: file.filename,
            ref: headSha,
          });

          const content = Buffer.from(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (response.data as any).content,
            'base64',
          ).toString();
          fileContents.set(file.filename, content);
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
      }
    }

    return {
      fileContents,
    };
  }
}
