import { User } from "../../src";

describe("User Entity", () => {
	test("should create user with valid data", () => {
		const user = User.create({
			name: "Joao Silva",
			email: "joao@example.com",
		});

		expect(user.id).toBeDefined();
		expect(user.name).toBe("Joao Silva");
		expect(user.email).toBe("joao@example.com");
	});

	test("should fail when email is invalid", () => {
		const result = User.tryCreate({
			name: "Joao Silva",
			email: "invalid-email",
		});

		expect(result.isFailure).toBe(true);
	});
});
