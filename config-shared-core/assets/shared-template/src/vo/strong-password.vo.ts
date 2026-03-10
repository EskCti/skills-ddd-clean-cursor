import { Result, ValueObject, ValueObjectConfig } from "../base";

export class StrongPassword extends ValueObject<string, ValueObjectConfig> {
    private static readonly WEAK_PASSWORD = "WEAK_PASSWORD";
    private constructor(value: string, config?: ValueObjectConfig) {
        super(value, config);
    }

    public static create(
        value: string,
        config?: ValueObjectConfig,
    ): StrongPassword {
        const result = StrongPassword.tryCreate(value, config);
        result.throwIfFailed();
        return result.instance;
    }

    public static tryCreate(
        value: string,
        config?: ValueObjectConfig,
    ): Result<StrongPassword> {
        try {
            if (value.length < 8) {
                throw new Error(StrongPassword.WEAK_PASSWORD);
            }
            if (!/[A-Z]/.test(value)) {
                throw new Error(StrongPassword.WEAK_PASSWORD);
            }
            if (!/[a-z]/.test(value)) {
                throw new Error(StrongPassword.WEAK_PASSWORD);
            }
            if (!/[0-9]/.test(value)) {
                throw new Error(StrongPassword.WEAK_PASSWORD);
            }
            if (!/[^A-Za-z0-9]/.test(value)) {
                throw new Error(StrongPassword.WEAK_PASSWORD);
            }
            return Result.ok(new StrongPassword(value, config));
        } catch (error: any) {
            return Result.fail(error.message);
        }
    }
}
