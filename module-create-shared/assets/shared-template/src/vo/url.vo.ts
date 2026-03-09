import { Result, ValueObject, ValueObjectConfig } from "../base";

export class URL extends ValueObject<string, ValueObjectConfig> {
	private static readonly INVALID_URL = "INVALID_URL";

	private constructor(value: string, config?: ValueObjectConfig) {
		super(value, config);
	}

	public static create(value: string, config?: ValueObjectConfig): URL {
		const result = URL.tryCreate(value, config);
		result.throwIfFailed();
		return result.instance;
	}

	public static tryCreate(
		value: string,
		config?: ValueObjectConfig,
	): Result<URL> {
		try {
			const url = value.trim();
			new globalThis.URL(url);
			return Result.ok(new URL(url, config));
		} catch (error: any) {
			return Result.fail(URL.INVALID_URL);
		}
	}
}
