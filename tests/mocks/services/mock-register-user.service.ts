import { RegisterUserService } from 'src/github/abstracts/register-user.abstract';

export class MockRegisterUserService implements RegisterUserService {
  setGitProvider = vi.fn();

  registerUserData = vi.fn();

  registerHistory = vi.fn();
}
