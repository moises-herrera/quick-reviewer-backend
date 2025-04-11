import { inject } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';
import { ProjectRepository } from 'src/common/database/abstracts/project.repository';

export class RepositoryController {
  constructor(
    @inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  getRepositories: AuthHttpHandler = async (req, res, next): Promise<void> => {
    try {
      const userId = req.userId as string;
      const ownerName = req.params.ownerName;
      const paginationOptions = parsePaginationOptions(req.query);
      const response = await this.projectRepository.getPaginatedRepositories({
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
