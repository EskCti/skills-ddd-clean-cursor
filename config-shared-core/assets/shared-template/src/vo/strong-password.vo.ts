import { Result, ValueObject, ValueObjectConfig } from '../base';

export class StrongPassword extends ValueObject<string, ValueObjectConfig> {
  private static readonly WEAK_PASSWORD_TOO_SHORT = 'WEAK_PASSWORD_TOO_SHORT';
  private static readonly WEAK_PASSWORD_NO_UPPERCASE = 'WEAK_PASSWORD_NO_UPPERCASE';
  private static readonly WEAK_PASSWORD_NO_LOWERCASE = 'WEAK_PASSWORD_NO_LOWERCASE';
  private static readonly WEAK_PASSWORD_NO_DIGIT = 'WEAK_PASSWORD_NO_DIGIT';
  private static readonly WEAK_PASSWORD_NO_SPECIAL = 'WEAK_PASSWORD_NO_SPECIAL';

  private constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value: string, config?: ValueObjectConfig): StrongPassword {
    const result = StrongPassword.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<StrongPassword> {
    const errors: string[] = [];

    if (value.length < 8) {
      errors.push(StrongPassword.WEAK_PASSWORD_TOO_SHORT);
    }
    if (!/[A-Z]/.test(value)) {
      errors.push(StrongPassword.WEAK_PASSWORD_NO_UPPERCASE);
    }
    if (!/[a-z]/.test(value)) {
      errors.push(StrongPassword.WEAK_PASSWORD_NO_LOWERCASE);
    }
    if (!/[0-9]/.test(value)) {
      errors.push(StrongPassword.WEAK_PASSWORD_NO_DIGIT);
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      errors.push(StrongPassword.WEAK_PASSWORD_NO_SPECIAL);
    }

    if (errors.length > 0) {
      return Result.fail(errors);
    }

    return Result.ok(new StrongPassword(value, config));
  }
}
