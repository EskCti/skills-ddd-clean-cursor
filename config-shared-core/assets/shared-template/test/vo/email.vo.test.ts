import { Email } from "../../src";

describe("Email", () => {
	test("should create with valid email", () => {
		const result = Email.tryCreate("test@example.com");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("test@example.com");
	});

	test("should normalize email with spaces and uppercase letters", () => {
		const result = Email.tryCreate("  Test.User@Example.COM  ");

		expect(result.isOk).toBe(true);
		expect(result.instance.value).toBe("test.user@example.com");
	});

	test("should expose local and domain parts", () => {
		const email = Email.create("john.doe@pharmacore.com");

		expect(email.local).toBe("john.doe");
		expect(email.domain).toBe("pharmacore.com");
	});

	test("should return empty local when split result is undefined", () => {
		const email = Object.create(Email.prototype) as Email & { value: any };
		email.value = {
			split: () => undefined,
		};

		expect(email.local).toBe("");
	});

	test("should return empty domain when split has no domain part", () => {
		const email = Object.create(Email.prototype) as Email & { value: any };
		email.value = {
			split: () => ["only-local"],
		};

		expect(email.domain).toBe("");
	});

	test("should fail with invalid email", () => {
		const result = Email.tryCreate("invalid-email");

		expect(result.isFailure).toBe(true);
		expect(result.errors).toContain("INVALID_EMAIL");
	});

	test("should throw when using create with invalid email", () => {
		expect(() => Email.create("invalid-email")).toThrow();
	});
});
