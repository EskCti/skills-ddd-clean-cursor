import { Result } from '../base/result';
import { ValueObject, ValueObjectConfig } from '../base/vo';
import { v4 as uuidv4 } from 'uuid';

export class Id extends ValueObject<string, ValueObjectConfig> {
  protected static readonly INVALID_ID: string = 'INVALID_ID';
  protected constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  public static create(value?: string | undefined, config?: ValueObjectConfig): Id {
    const result = Id.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  public static tryCreate(value?: string | undefined, config?: ValueObjectConfig): Result<Id> {
    try {
      const hasValue = value !== undefined && value !== null && value !== '';
      const idValue = hasValue ? value!.trim().toLowerCase() : uuidv4();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(idValue)) {
        throw new Error(this.INVALID_ID);
      }
      return Result.ok(new Id(idValue, config));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  public static required(value: string, config?: ValueObjectConfig): Result<Id> {
    if (!value) {
      return Result.fail(this.INVALID_ID);
    }
    const result = Id.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result;
  }
}
