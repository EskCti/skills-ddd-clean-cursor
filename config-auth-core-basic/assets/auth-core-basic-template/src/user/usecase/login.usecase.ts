import { FindPasswordHashQuery, UserRepository } from '../provider';
import { PasswordErrors, PasswordCryptoProvider } from '../../password';
import { Result, UseCase } from '__SHARED_PACKAGE_NAME__';
import { UserProps } from '../model';

export interface LoginIn {
  email: string;
  password: string;
}

export interface LoginOut extends UserProps {}

export class LoginUseCase implements UseCase<LoginIn, LoginOut> {
  constructor(
    private readonly repo: UserRepository,
    private readonly findPassHash: FindPasswordHashQuery,
    private readonly passwordCryptoProvider: PasswordCryptoProvider,
  ) {}

  async execute(input: LoginIn): Promise<Result<LoginOut>> {
    return Result.try(async () => {
      const tryFindUser = await this.repo.findByEmail(input.email);
      if (tryFindUser.isFailure) return Result.fail(tryFindUser.errors);

      const tryFindPass = await this.findPassHash.execute(tryFindUser.instance.id);
      if (tryFindPass.isFailure) return Result.fail(tryFindPass.errors);

      const isSamePass = await this.passwordCryptoProvider.compare(input.password, tryFindPass.instance.hash);
      if (!isSamePass) return Result.fail(PasswordErrors.MISMATCH);

      return tryFindUser.instance.props;
    });
  }
}
