import { Password, PasswordCryptoProvider, PasswordRepository } from '../../password';
import { Result, TransactionManager, UseCase } from '__SHARED_PACKAGE_NAME__';
import { User, UserErrors, UserRepository } from '../../user';
import { UserExistsQuery } from '../provider';

export interface CreateUserIn {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export class CreateUserUseCase implements UseCase<CreateUserIn, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passRepo: PasswordRepository,
    private readonly userExistsQuery: UserExistsQuery,
    private readonly passwordCryptoProvider: PasswordCryptoProvider,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(data: CreateUserIn): Promise<Result<void>> {
    return Result.try(async () => {
      const tryUserExists = await this.userExistsQuery.execute({
        email: data.email,
      });
      if (tryUserExists.isFailure) return Result.fail(tryUserExists.errors);
      if (tryUserExists.instance) return Result.fail(UserErrors.EMAIL_ALREADY_EXISTS);

      const tryHashedPassword = await this.passwordCryptoProvider.hash(data.password);
      const password = Password.create({ content: tryHashedPassword });

      const userResult = User.tryCreate({
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl?.trim() || undefined,
      });
      if (userResult.isFailure) return Result.fail(userResult.errors);
      const user = userResult.instance;

      await this.transactionManager.runInTransaction(async (tx) => {
        const tryCreateUser = await this.userRepo.create(user, tx);
        tryCreateUser.validator.throwsIfFailed();

        const tryCreatePass = await this.passRepo.create(password, user.id, tx);
        tryCreatePass.validator.throwsIfFailed();
      });
    });
  }
}
