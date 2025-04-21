import { StatusCodes } from 'http-status-codes';
import { container } from 'src/app/config/container-config';
import { UserRepository } from 'src/common/database/abstracts/user.repository';
import { AuthHttpHandler } from 'src/common/interfaces/http-handler';

export const accountSettingsPermissionsMiddleware: AuthHttpHandler = async (
  req,
  res,
  next,
) => {
  const { userId } = req;
  const { accountId } = req.params;
  const userRepository = container.get(UserRepository);

  const account = await userRepository.getUserAccount(
    userId as string,
    accountId,
  );

  if (!account || !account.canConfigureBot) {
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: 'You do not have permission to manage this account' });
    return;
  }

  next();
};
