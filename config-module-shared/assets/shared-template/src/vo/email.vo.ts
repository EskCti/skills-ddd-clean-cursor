import { Result, ValueObject, ValueObjectConfig } from "../base";

export class Email extends ValueObject<string, ValueObjectConfig> {
    private static readonly INVALID_EMAIL = "INVALID_EMAIL";
    private constructor(value: string, config?: ValueObjectConfig) {
        super(value, config);
    }

    get local(): string {
        return this.value.split("@")?.[0] ?? "";
    }

    get domain(): string {
        return this.value.split("@")?.[1] ?? "";
    }

    public static create(value: string, config?: ValueObjectConfig): Email {
        const result = Email.tryCreate(value, config);
        result.throwIfFailed();
        return result.instance;
    }

    public static tryCreate(
        value: string,
        config?: ValueObjectConfig,
    ): Result<Email> {
        try {
            const email = value.trim().toLowerCase();
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(email)) {
                throw new Error(Email.INVALID_EMAIL);
            }
            return Result.ok(new Email(email, config));
        } catch (error: any) {
            return Result.fail(error.message);
        }
    }
}
