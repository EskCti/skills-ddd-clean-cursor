import { Result, ValueObject, ValueObjectConfig } from "../base";

export class HashPassword extends ValueObject<string, ValueObjectConfig> {
    private static readonly INVALID_HASH_PASSWORD = "INVALID_HASH_PASSWORD";
    private static readonly BCRYPT_HASH_REGEX =
        /^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$/;

    private constructor(value: string, config?: ValueObjectConfig) {
        super(value, config);
    }

    public static create(
        value: string,
        config?: ValueObjectConfig,
    ): HashPassword {
        const result = HashPassword.tryCreate(value, config);
        result.throwIfFailed();
        return result.instance;
    }

    public static tryCreate(
        value: string,
        config?: ValueObjectConfig,
    ): Result<HashPassword> {
        try {
            if (!HashPassword.BCRYPT_HASH_REGEX.test(value)) {
                throw new Error(HashPassword.INVALID_HASH_PASSWORD);
            }

            return Result.ok(new HashPassword(value, config));
        } catch (error: any) {
            return Result.fail(error.message);
        }
    }
}
