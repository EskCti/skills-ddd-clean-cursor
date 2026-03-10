import { Result, ValueObject, ValueObjectConfig } from "../base";

interface PersonNameConfig extends ValueObjectConfig {}

export class PersonName extends ValueObject<string, PersonNameConfig> {
  private static readonly TOO_SHORT = "NAME_TOO_SHORT";
  private static readonly TOO_LONG = "NAME_TOO_LONG";
  private static readonly MUST_HAVE_FIRST_AND_LAST_NAME =
    "MUST_HAVE_FIRST_AND_LAST_NAME";

  private constructor(value: string, config?: PersonNameConfig) {
    super(value, config);
  }

  public static create(value: string, config?: PersonNameConfig): PersonName {
    const result = PersonName.tryCreate(value, config);
    result.throwIfFailed();
    return result.instance;
  }

  public static tryCreate(
    value: string,
    config?: PersonNameConfig,
  ): Result<PersonName> {
    try {
      const trimmedValue = value.trim();
      const min = 3;
      const max = 50;

      if (trimmedValue.length < min) {
        throw new Error(PersonName.TOO_SHORT);
      }
      if (trimmedValue.length > max) {
        throw new Error(PersonName.TOO_LONG);
      }

      const words = trimmedValue.split(/\s+/).filter((w) => w.length > 0);
      if (words.length < 2) {
        throw new Error(PersonName.MUST_HAVE_FIRST_AND_LAST_NAME);
      }

      return Result.ok(new PersonName(trimmedValue, config));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
