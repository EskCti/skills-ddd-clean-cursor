import { Email, PersonName, URL as URLVO } from "__SHARED_PACKAGE_NAME__";
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

	test("should expose avatarUrl from props", () => {
		const user = User.create({
			name: "Joao Silva",
			email: "joao@example.com",
			avatarUrl: "https://cdn.example.com/avatar.png",
		});

		expect(user.avatarUrl).toBe("https://cdn.example.com/avatar.png");
	});

	test("should expose $name as PersonName value object", () => {
		const user = User.create({
			name: "Joao Silva",
			email: "joao@example.com",
		});

		expect(user.$name).toBeInstanceOf(PersonName);
		expect(user.$name.value).toBe("Joao Silva");
	});

	test("should expose $email as Email value object", () => {
		const user = User.create({
			name: "Joao Silva",
			email: "JOAO@EXAMPLE.COM",
		});

		expect(user.$email).toBeInstanceOf(Email);
		expect(user.$email.value).toBe("joao@example.com");
	});

	test("should expose $avatarUrl as URL value object when avatar exists", () => {
		const user = User.create({
			name: "Joao Silva",
			email: "joao@example.com",
			avatarUrl: "https://cdn.example.com/avatar.png",
		});

		expect(user.$avatarUrl).toBeInstanceOf(URLVO);
		expect(user.$avatarUrl?.value).toBe("https://cdn.example.com/avatar.png");
	});

	test("should return null for $avatarUrl when avatar does not exist", () => {
		const user = User.create({
			name: "Joao Silva",
			email: "joao@example.com",
		});

		expect(user.$avatarUrl).toBeNull();
	});

	test("should fail when email is invalid", () => {
		const result = User.tryCreate({
			name: "Joao Silva",
			email: "invalid-email",
		});

		expect(result.isFailure).toBe(true);
	});
});
