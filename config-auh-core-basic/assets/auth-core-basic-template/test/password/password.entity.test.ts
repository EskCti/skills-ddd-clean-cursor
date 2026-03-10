import { Password, PasswordStatus } from "../../src";

describe("Password Entity", () => {
	test("should fail for invalid hash format", () => {
		const result = Password.tryCreate({
			content: "plain-password",
			status: PasswordStatus.ACTIVE,
		});

		expect(result.isFailure).toBe(true);
	});

	test("should create password with valid bcrypt hash", () => {
		const validHash =
			"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

		const password = Password.create({
			content: validHash,
			status: PasswordStatus.ACTIVE,
		});

		expect(password.content).toBe(validHash);
		expect(password.status).toBe(PasswordStatus.ACTIVE);
	});
});
