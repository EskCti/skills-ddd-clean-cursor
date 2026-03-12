import { Result, ValueObject, ValueObjectConfig } from '../base';

export class HashPassword extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID_HASH_PASSWORD = 'INVALID_HASH_PASSWORD';
  private static readonly HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

  private constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value: string, config?: ValueObjectConfig): HashPassword {
    const result = HashPassword.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value: string, config?: ValueObjectConfig): Result<HashPassword> {
    try {
      const hash = value?.trim() ?? '';

      if (!HashPassword.HASH_REGEX.test(hash)) {
        throw new Error(HashPassword.INVALID_HASH_PASSWORD);
      }

      return Result.ok(new HashPassword(hash, config));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
