import { Text } from "../../src";

describe("Text", () => {
	test("should create valid text with tryCreate", () => {
		const result = Text.tryCreate("Texto valido");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("Texto valido");
	});

	test("should trim text before creating", () => {
		const result = Text.tryCreate("   Texto com espacos   ");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("Texto com espacos");
	});

	test("should fail when text is shorter than minLength", () => {
		const result = Text.tryCreate("ab", { minLength: 3 });

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("TEXT_TOO_SHORT");
	});

	test("should fail when text is longer than maxLength", () => {
		const result = Text.tryCreate("abcd", { maxLength: 3 });

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("TEXT_TOO_LONG");
	});

	test("should ignore max validation when maxLength is 0", () => {
		const result = Text.tryCreate("texto maior", { maxLength: 0 });

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("texto maior");
	});

	test("should fail when text is undefined", () => {
		const result = Text.tryCreate(undefined as unknown as string);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("TEXT_TOO_SHORT");
	});

	test("should create with create method", () => {
		const text = Text.create("  Conteudo  ");

		expect(text.value).toBe("Conteudo");
	});

	test("should throw when create receives invalid text", () => {
		expect(() => Text.create("")).toThrow();
	});
});
