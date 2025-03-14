import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { CodeReviewRepository } from 'src/database/repositories/code-review.repository';
import { PullRequestFiltersType } from 'src/statistics/schemas/pull-request-filters.schema';

@injectable()
export class CodeReviewController {
  constructor(
    @inject(CodeReviewRepository)
    private readonly codeReviewRepository: CodeReviewRepository,
  ) {}

  getCodeReviewsReviews: AuthHttpHandler = async (
    req,
    res,
    next,
  ): Promise<void> => {
    try {
      const userId = req.userId as number;
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
          userId: req.userId as number,
        });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
