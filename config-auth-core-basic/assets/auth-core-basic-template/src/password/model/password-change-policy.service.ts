import { Result, StrongPassword } from '__SHARED_PACKAGE_NAME__';
import { PasswordErrors } from '../errors';
import { PasswordCryptoProvider } from '../provider/password-crypto.provider';
import { Password } from './password.entity';

export interface ValidatePasswordChangeInput {
  newPassword: string;
  confirmPassword: string;
  recentPasswords: Password[];
  passwordCryptoProvider: PasswordCryptoProvider;
  maxRecentPasswordsToCheck?: number;
}

export class PasswordChangePolicyService {
  private static readonly DEFAULT_MAX_RECENT_PASSWORDS = 5;

  static async validate(input: ValidatePasswordChangeInput): Promise<Result<void>> {
    if (input.newPassword !== input.confirmPassword) {
      return Result.fail(PasswordErrors.MISMATCH);
    }

    const strongPasswordResult = StrongPassword.tryCreate(input.newPassword);
    if (strongPasswordResult.isFailure) {
      return strongPasswordResult.withFail;
    }

    const maxRecentPasswordsToCheck =
      input.maxRecentPasswordsToCheck ?? PasswordChangePolicyService.DEFAULT_MAX_RECENT_PASSWORDS;
    const recentPasswords = input.recentPasswords.slice(0, maxRecentPasswordsToCheck);

    for (const previousPassword of recentPasswords) {
      const isReusedPassword = await input.passwordCryptoProvider.compare(input.newPassword, previousPassword.content);

      if (isReusedPassword) {
        return Result.fail(PasswordErrors.REUSED_RECENT_PASSWORD);
      }
    }

    return Result.ok();
  }
}
