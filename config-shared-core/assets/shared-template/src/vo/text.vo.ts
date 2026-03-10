import { Result, ValueObject, ValueObjectConfig } from "../base";

export interface TextConfig extends ValueObjectConfig {
    minLength?: number;
    maxLength?: number;
}

export class Text extends ValueObject<string, TextConfig> {
    protected static readonly TOO_SHORT: string = "TEXT_TOO_SHORT";
    protected static readonly TOO_LONG: string = "TEXT_TOO_LONG";
    protected static readonly DEFAULT_MIN_LENGTH: number = 1;
    protected static readonly DEFAULT_MAX_LENGTH = Number.MAX_SAFE_INTEGER;

    protected constructor(value: string, config?: TextConfig) {
        super(value, config);
    }

    public static create(value: string, config?: TextConfig): Text {
        const result = Text.tryCreate(value, config);
        result.throwIfFailed();
        return result.instance;
    }

    public static tryCreate(text: string, config?: TextConfig): Result<Text> {
        try {
            const value = text?.trim() ?? "";
            const min = config?.minLength ?? this.DEFAULT_MIN_LENGTH;
            const max = config?.maxLength ?? this.DEFAULT_MAX_LENGTH;

            if (value.length < min) {
                throw new Error(this.TOO_SHORT);
            }
            if (max && value.length > max) {
                throw new Error(this.TOO_LONG);
            }

            return Result.ok(new Text(value, config));
        } catch (error: any) {
            return Result.fail(error.message);
        }
    }
}
