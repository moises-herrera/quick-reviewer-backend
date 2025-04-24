import { RegisterUserService } from 'src/common/abstracts/register-user.abstract';

export class MockRegisterUserService implements RegisterUserService {
  setGitProvider = vi.fn();

  registerUserData = vi.fn();

  registerHistory = vi.fn();
}
