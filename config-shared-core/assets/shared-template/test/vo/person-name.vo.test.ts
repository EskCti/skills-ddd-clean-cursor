import { PersonName } from "../../src";

describe("PersonName", () => {
	test("should create with valid first and last name", () => {
		const result = PersonName.tryCreate("Joao Silva");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("Joao Silva");
	});

	test("should trim value before creating", () => {
		const result = PersonName.tryCreate("  Maria   Souza  ");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("Maria   Souza");
	});

	test("should fail when name is too short", () => {
		const result = PersonName.tryCreate("Jo");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("NAME_TOO_SHORT");
	});

	test("should fail when name is too long", () => {
		const result = PersonName.tryCreate("a".repeat(51));

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("NAME_TOO_LONG");
	});

	test("should fail when name has only one word", () => {
		const result = PersonName.tryCreate("Joao");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("MUST_HAVE_FIRST_AND_LAST_NAME");
	});

	test("should create with create method", () => {
		const value = PersonName.create("Ana Clara");

		expect(value.value).toBe("Ana Clara");
	});

	test("should throw when create receives invalid person name", () => {
		expect(() => PersonName.create("Ana")).toThrow();
	});
});
