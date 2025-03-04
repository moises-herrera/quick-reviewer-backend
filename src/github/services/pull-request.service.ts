import { PullRequest } from '@prisma/client';
import { prisma } from 'src/database/db-connection';

export class PullRequestService {
  async savePullRequest(data: PullRequest): Promise<void> {
    await prisma.pullRequest.create({
      data,
    });
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
}
