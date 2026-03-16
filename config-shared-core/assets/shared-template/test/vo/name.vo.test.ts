import { Name } from "../../src";

describe("Name", () => {
	test("should create with valid name", () => {
		const result = Name.tryCreate("Produto Teste");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("Produto Teste");
	});

	test("should trim value before creating", () => {
		const result = Name.tryCreate("   Nome Valido   ");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("Nome Valido");
	});

	test("should fail when name is too short", () => {
		const result = Name.tryCreate("Ab");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("NAME_TOO_SHORT");
	});

	test("should fail when name is too long", () => {
		const result = Name.tryCreate("a".repeat(101));

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("NAME_TOO_LONG");
	});

	test("should create with create method", () => {
		const name = Name.create("Nome Completo");

		expect(name.value).toBe("Nome Completo");
	});

	test("should throw when create receives invalid name", () => {
		expect(() => Name.create("ab")).toThrow();
	});
});
