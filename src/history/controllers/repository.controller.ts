import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { ProjectRepository } from 'src/core/repositories/project.repository';

@injectable()
export class RepositoryController {
  constructor(
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  getRepositories: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as number;
      const ownerName = req.params.ownerName;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.projectRepository.getRepositories({
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
