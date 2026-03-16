import { Result, ValueObject, ValueObjectConfig } from "../base";

export class DotSeparatedName extends ValueObject<string, ValueObjectConfig> {
	private static readonly INVALID_DOT_SEPARATED_NAME =
		"INVALID_DOT_SEPARATED_NAME";

	private constructor(value: string, config?: ValueObjectConfig) {
		super(value, config);
	}

	public static create(
		value: string,
		config?: ValueObjectConfig,
	): DotSeparatedName {
		const result = DotSeparatedName.tryCreate(value, config);
		result.validator.throwsIfFailed();
		return result.instance;
	}

	public static tryCreate(
		value: string,
		config?: ValueObjectConfig,
	): Result<DotSeparatedName> {
		try {
			if (typeof value !== "string") {
				throw new Error(DotSeparatedName.INVALID_DOT_SEPARATED_NAME);
			}

			const normalized = DotSeparatedName.normalize(value);

			const pattern = /^[a-z0-9]+(\.[a-z0-9]+)*$/;

			if (!pattern.test(normalized)) {
				throw new Error(DotSeparatedName.INVALID_DOT_SEPARATED_NAME);
			}

			return Result.ok(new DotSeparatedName(normalized, config));
		} catch (error: any) {
			return Result.fail(error.message);
		}
	}

	static normalize(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/\s+/g, ".")
			.replace(/\.+/g, ".")
			.replace(/^\.|\.$/g, "");
	}
}
