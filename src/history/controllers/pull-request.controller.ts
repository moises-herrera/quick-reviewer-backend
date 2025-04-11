import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { inject } from 'inversify';
import { PullRequestRepository } from 'src/common/database/abstracts/pull-request.repository';

export class PullRequestController {
  constructor(
    @inject(PullRequestRepository)
    private readonly pullRequestRepository: PullRequestRepository,
  ) {}

  getPullRequests: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as string;
      const { ownerName, repositoryName } = req.params;
      const options = parsePaginationOptions(req.query);
      const response = await this.pullRequestRepository.getPullRequests({
        ...options,
        userId,
        ownerName,
        repositoryName,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
