import { StatusCodes } from 'http-status-codes';
import { container } from 'src/app/config/container-config';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export const repositorySettingsPermissionsMiddleware: AuthHttpHandler = async (
  req,
  res,
  next,
) => {
  const { userId } = req;
  const { repositoryId } = req.params;

  const userRepository = container.get(UserRepository);

  const repository = await userRepository.getUserRepository(
    userId as string,
    repositoryId,
  );

  if (!repository) {
    res.status(StatusCodes.FORBIDDEN).json({
      message: 'You do not have permission to access this repository',
    });
    return;
  }

  next();
};
