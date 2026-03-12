import { Result } from '../base/result';
import { Text, TextConfig } from './text.vo';

export class ShortDescription extends Text {
  protected static override readonly TOO_SHORT: string = 'SHORT_DESCRIPTION_TOO_SHORT';
  protected static override readonly TOO_LONG: string = 'SHORT_DESCRIPTION_TOO_LONG';

  protected static override readonly DEFAULT_MIN_LENGTH = 15;
  protected static override readonly DEFAULT_MAX_LENGTH = 80;

  protected constructor(value: string, config?: TextConfig) {
    super(value, config);
  }

  public static create(value: string, config?: TextConfig): ShortDescription {
    const result = ShortDescription.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(text: string, config?: TextConfig): Result<ShortDescription> {
    try {
      const value = text?.trim() ?? '';
      const min = config?.minLength ?? this.DEFAULT_MIN_LENGTH;
      const max = config?.maxLength ?? this.DEFAULT_MAX_LENGTH;

      if (value.length < min) {
        throw new Error(this.TOO_SHORT);
      }
      if (max && value.length > max) {
        throw new Error(this.TOO_LONG);
      }

      return Result.ok(new ShortDescription(value, config));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
