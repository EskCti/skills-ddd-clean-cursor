import { Result, ValueObject, ValueObjectConfig } from "../base";

interface NameProps extends ValueObjectConfig {}

export class Name extends ValueObject<string, NameProps> {
    protected static readonly TOO_SHORT: string = "NAME_TOO_SHORT";
    protected static readonly TOO_LONG: string = "NAME_TOO_LONG";
    protected constructor(value: string, config?: NameProps) {
        super(value, config);
    }

    public static create(value: string, config?: NameProps): Name {
        const result = Name.tryCreate(value, config);
        result.validator.throwsIfFailed();
        return result.instance;
    }

    public static tryCreate(value: string, config?: NameProps): Result<Name> {
        try {
            const trimmedValue = value.trim();
            const min = 3;
            const max = 100;

            if (trimmedValue.length < min) {
                throw new Error(this.TOO_SHORT);
            }
            if (trimmedValue.length > max) {
                throw new Error(this.TOO_LONG);
            }

            return Result.ok(new Name(trimmedValue, config));
        } catch (error: any) {
            return Result.fail(error.message);
        }
    }
}
