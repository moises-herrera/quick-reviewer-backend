import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { PullRequestFiltersType } from 'src/common/schemas/pull-request-filters.schema';
import { CodeReviewRepository } from 'src/common/database/abstracts/code-review.repository';

export class CodeReviewController {
  constructor(
    @inject(CodeReviewRepository)
    private readonly codeReviewRepository: CodeReviewRepository,
  ) {}

  getCodeReviews: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as string;
      const { ownerName, repositoryName, pullRequestNumber } = req.params;
      const options = parsePaginationOptions(req.query);
      const response = await this.codeReviewRepository.getCodeReviews({
        ...options,
        userId,
        ownerName,
        repositoryName,
        pullRequestNumber: Number(pullRequestNumber),
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCodeReviewsDetailedInfo: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const options = parsePaginationOptions(req.query);
      const response =
        await this.codeReviewRepository.getCodeReviewsDetailedInfo({
          ...(req.body as PullRequestFiltersType),
          ...options,
          userId: req.userId as string,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
