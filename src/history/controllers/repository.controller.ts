import { ProjectRepository } from '../../github/repositories/project-repository.repository';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export class RepositoryController {
  private readonly repositoryService = new ProjectRepository();

  getRepositories: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const ownerName = req.params.ownerName;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.repositoryService.getRepositories({
        ...paginationOptions,
        userId,
        ownerName,
      });

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  };
}
