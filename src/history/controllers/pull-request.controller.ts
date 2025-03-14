import { PullRequestRepository } from '../../database/repositories/pull-request.repository';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { inject, injectable } from 'inversify';

@injectable()
export class PullRequestController {
  constructor(
    @inject(PullRequestRepository)
    private readonly pullRequestRepository: PullRequestRepository,
  ) {}

  getPullRequests: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
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
