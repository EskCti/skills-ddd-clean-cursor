import { DotSeparatedName } from "../../src";

describe("DotSeparatedName", () => {
	test("should create a valid dot separated name", () => {
		const result = DotSeparatedName.tryCreate("user.profile");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("user.profile");
	});

	test("should normalize uppercase, spaces, accents and repeated dots", () => {
		const result = DotSeparatedName.tryCreate("  João   SILVA...Admin  ");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("joao.silva.admin");
	});

	test("should create using create method", () => {
		const value = DotSeparatedName.create("  core users  ");

		expect(value.value).toBe("core.users");
	});

	test("should normalize direct static method", () => {
		const normalized = DotSeparatedName.normalize("  José  da  Silva  ");

		expect(normalized).toBe("jose.da.silva");
	});

	test("should fail when value is not a string", () => {
		const result = DotSeparatedName.tryCreate(null as unknown as string);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_DOT_SEPARATED_NAME");
	});

	test("should fail when normalized value has invalid characters", () => {
		const result = DotSeparatedName.tryCreate("core_users");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_DOT_SEPARATED_NAME");
	});

	test("should throw when create receives invalid value", () => {
		expect(() => DotSeparatedName.create("core-users")).toThrow();
	});
});
