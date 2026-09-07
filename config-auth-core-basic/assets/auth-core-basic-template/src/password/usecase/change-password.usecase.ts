import { Result, UseCase } from '__SHARED_PACKAGE_NAME__';
import { UserExistsQuery } from '../../application';
import { Password, PasswordChangePolicyService } from '../model';
import { PasswordRepository, PasswordCryptoProvider } from '../provider';
import { PasswordErrors } from '../errors';

export interface ChangePasswordIn {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class ChangePasswordUseCase implements UseCase<ChangePasswordIn, void> {
  constructor(
    private readonly passRepo: PasswordRepository,
    private readonly userExistsQuery: UserExistsQuery,
    private readonly passwordCryptoProvider: PasswordCryptoProvider,
  ) {}

  async execute(input: ChangePasswordIn): Promise<Result<void>> {
    return Result.try(async () => {
      const tryUserExists = await this.userExistsQuery.execute({ id: input.userId });
      if (tryUserExists.isFailure) return Result.fail(tryUserExists.errors);
      if (!tryUserExists.instance) return Result.fail(PasswordErrors.INVALID_USER);

      const tryRecentPasswords = await this.passRepo.findRecentByUserId(input.userId, 5);
      if (tryRecentPasswords.isFailure) return Result.fail(tryRecentPasswords.errors);

      const tryPasswordPolicy = await PasswordChangePolicyService.validate({
        newPassword: input.newPassword,
        confirmPassword: input.confirmPassword,
        recentPasswords: tryRecentPasswords.instance,
        passwordCryptoProvider: this.passwordCryptoProvider,
      });
      if (tryPasswordPolicy.isFailure) return Result.fail(tryPasswordPolicy.errors);

      const hashedPassword = await this.passwordCryptoProvider.hash(input.newPassword);
      const newPass = Password.create({ content: hashedPassword });

      const tryCreateNewPass = await this.passRepo.create(newPass, input.userId);
      if (tryCreateNewPass.isFailure) return Result.fail(tryCreateNewPass.errors);
    });

    // const recentPasswordsResult = await this.passRepo.findRecentByUserId(
    // 	input.userId,
    // 	5,
    // );

    // if (recentPasswordsResult.isFailure) {
    // 	return recentPasswordsResult.withFail;
    // }

    // const passwordPolicyResult = await PasswordChangePolicyService.validate({
    // 	newPassword: input.newPassword,
    // 	confirmPassword: input.confirmPassword,
    // 	recentPasswords: recentPasswordsResult.instance,
    // 	passwordCryptoProvider: this.passwordCryptoProvider,
    // });

    // if (passwordPolicyResult.isFailure) {
    // 	return passwordPolicyResult.withFail;
    // }

    // const hashedPassword = await this.passwordCryptoProvider.hash(input.newPassword);

    // const newPassResult = Password.tryCreate({ content: hashedPassword });

    // if (newPassResult.isFailure) {
    // 	return newPassResult.withFail;
    // }

    // const createResult = await this.passRepo.create(
    // 	newPassResult.instance,
    // 	input.userId,
    // );

    // return createResult
  }
}
