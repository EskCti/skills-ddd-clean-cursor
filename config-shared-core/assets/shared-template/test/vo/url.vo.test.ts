import { URL as URLVo } from "../../src";

describe("URL", () => {
	test("should create valid url with tryCreate", () => {
		const result = URLVo.tryCreate("https://example.com/path");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("https://example.com/path");
	});

	test("should trim url before creating", () => {
		const result = URLVo.tryCreate("  https://example.com  ");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("https://example.com");
	});

	test("should create valid url with create", () => {
		const url = URLVo.create("https://pharmacore.com");

		expect(url.value).toBe("https://pharmacore.com");
	});

	test("should fail with invalid url", () => {
		const result = URLVo.tryCreate("invalid-url");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_URL");
	});

	test("should fail when value is not a string", () => {
		const result = URLVo.tryCreate(null as unknown as string);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_URL");
	});

	test("should throw when create receives invalid url", () => {
		expect(() => URLVo.create("invalid-url")).toThrow();
	});
});
