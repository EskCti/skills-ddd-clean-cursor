import { Id } from "../../src";
import { validate as isUuid } from "uuid";

describe("Id", () => {
	test("should create with valid provided id", () => {
		const validId = "550e8400-e29b-41d4-a716-446655440000";
		const result = Id.tryCreate(validId, { attribute: "id" });

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe(validId);
	});

	test("should have a failed result if provided value not valid", () => {
		const invalidId = "not-a-uuid";
		const result = Id.tryCreate(invalidId, { attribute: "id" });

		expect(result.isFailure).toBe(true);
		expect(result.errors).toBeDefined();
	});

	test("should create a new id if no value is provided", () => {
		const result = Id.tryCreate(undefined);

		expect(result.isOk).toBe(true);
		expect(isUuid(result.instance.value)).toBe(true);
	});

	test("should fail when required id is empty", () => {
		const result = Id.required("");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_ID");
	});

	test("should return result when required id is valid", () => {
		const validId = "550e8400-e29b-41d4-a716-446655440000";
		const result = Id.required(validId, { attribute: "id" });

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe(validId);
	});

	test("should throw when required id is invalid", () => {
		expect(() => Id.required("invalid-id")).toThrow();
	});
});
