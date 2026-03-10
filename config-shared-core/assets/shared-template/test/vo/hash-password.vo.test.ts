import { HashPassword } from "../../src";

describe("HashPassword", () => {
	const validHash =
		"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

	test("should create a bcrypt hash password with tryCreate", () => {
		const result = HashPassword.tryCreate(validHash);

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe(validHash);
	});

	test("should create a bcrypt hash password with create", () => {
		const hashPassword = HashPassword.create(validHash);

		expect(hashPassword.value).toBe(validHash);
	});

	test("should accept bcrypt prefixes 2a, 2b and 2y", () => {
		const hash2a = validHash.replace("$2b$", "$2a$");
		const hash2y = validHash.replace("$2b$", "$2y$");

		expect(HashPassword.tryCreate(hash2a).isOk).toBe(true);
		expect(HashPassword.tryCreate(hash2y).isOk).toBe(true);
	});

	test("should fail when prefix is invalid", () => {
		const result = HashPassword.tryCreate(validHash.replace("$2b$", "$2z$"));

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_HASH_PASSWORD");
	});

	test("should fail when rounds are outside bcrypt range", () => {
		const roundsTooLow = HashPassword.tryCreate(validHash.replace("$10$", "$03$"));
		const roundsTooHigh = HashPassword.tryCreate(validHash.replace("$10$", "$32$"));

		expect(roundsTooLow.isFailure).toBe(true);
		expect(roundsTooLow.errors).toContain("INVALID_HASH_PASSWORD");
		expect(roundsTooHigh.isFailure).toBe(true);
		expect(roundsTooHigh.errors).toContain("INVALID_HASH_PASSWORD");
	});

	test("should fail when hash payload has invalid length", () => {
		const invalidPayloadLengthHash = validHash.slice(0, -1);
		const result = HashPassword.tryCreate(invalidPayloadLengthHash);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_HASH_PASSWORD");
	});

	test("should fail when hash payload has invalid characters", () => {
		const invalidCharsHash = `${validHash.slice(0, -1)}*`;
		const result = HashPassword.tryCreate(invalidCharsHash);

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_HASH_PASSWORD");
	});

	test("should throw when create receives invalid hash", () => {
		expect(() => HashPassword.create("invalid-hash")).toThrow();
	});
});
