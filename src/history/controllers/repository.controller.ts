import { inject, injectable } from 'inversify';
import { ProjectRepository } from '../../github/repositories/project-repository.repository';
import { StatusCodes } from 'http-status-codes';
import { parsePaginationOptions } from 'src/common/utils/parse-pagination-options';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

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
