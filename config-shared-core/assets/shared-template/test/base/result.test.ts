import { Result } from "../../src";

describe("Result", () => {
	test("should create ok result with instance", () => {
		const result = Result.ok("value");

		expect(result.isOk).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.instance).toBe("value");
	});

	test("should create ok result with null when instance is undefined", () => {
		const result = Result.ok();

		expect(result.isOk).toBe(true);
		expect(result.instance).toBeNull();
		expect(result.errors).toBeUndefined();
	});

	test("should create failed result from string", () => {
		const result = Result.fail("ERR");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual(["ERR"]);
	});

	test("should create failed result from string array", () => {
		const result = Result.fail(["E1", "E2"]);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual(["E1", "E2"]);
	});

	test("should use fallback error wrapper when fail receives non-array value", () => {
		const result = Result.fail(123 as unknown as string);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual([123]);
	});

	test("should return RESULT_UNDEFINED when no instance and no explicit errors", () => {
		const result = new Result<string>(undefined, []);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual(["RESULT_UNDEFINED"]);
	});

	test("should throw errors when throwIfFailed is called on failure", () => {
		const result = Result.fail("ERR");

		expect(() => result.throwIfFailed()).toThrow();
	});

	test("should not throw when throwIfFailed is called on success", () => {
		const result = Result.ok("ok");

		expect(() => result.throwIfFailed()).not.toThrow();
	});

	test("should return failed result with withFail", () => {
		const result = Result.fail("ERR");
		const failed = result.withFail;

		expect(failed.isFailure).toBe(true);
		expect(failed.errors).toEqual(["ERR"]);
	});

	test("should execute trySync with success", () => {
		const result = Result.trySync(() => "done");

		expect(result.isOk).toBe(true);
		expect(result.instance).toBe("done");
	});

	test("should execute trySync with failure", () => {
		const result = Result.trySync(() => {
			throw "SYNC_ERR";
		});

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual(["SYNC_ERR"]);
	});

	test("should execute try with success", async () => {
		const result = await Result.try(async () => Result.ok("done"));

		expect(result.isOk).toBe(true);
		expect(result.instance).toBe("done");
	});

	test("should execute try with failure", async () => {
		const result = await Result.try(async () => {
			throw "ASYNC_ERR";
		});

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual(["ASYNC_ERR"]);
	});

	test("should combine successful results", () => {
		const result = Result.combine([Result.ok("a"), Result.ok(2)] as const);

		expect(result.isOk).toBe(true);
		expect(result.instance).toEqual(["a", 2]);
	});

	test("should combine failed results and aggregate errors", () => {
		const result = Result.combine([
			Result.ok("a"),
			Result.fail("E1"),
			Result.fail(["E2", "E3"]),
		]);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual(["E1", "E2", "E3"]);
	});

	test("should combineAsync successful results", async () => {
		const result = await Result.combineAsync([
			Promise.resolve(Result.ok("a")),
			Promise.resolve(Result.ok("b")),
		]);

		expect(result.isOk).toBe(true);
		expect(result.instance).toEqual(["a", "b"]);
	});

	test("should combineAsync failed results", async () => {
		const result = await Result.combineAsync([
			Promise.resolve(Result.ok("a")),
			Promise.resolve(Result.fail("E1")),
		]);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toEqual(["E1"]);
	});

	test("should convert to string for ok and fail", () => {
		const ok = Result.ok({ a: 1 });
		const fail = Result.fail("ERR");

		expect(ok.toString()).toBe('Result.ok({"a":1})');
		expect(fail.toString()).toBe('Result.fail(["ERR"])');
	});
});
