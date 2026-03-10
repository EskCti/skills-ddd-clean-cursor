import {
	FindPasswordHashQuery,
	LoginUseCase,
	PasswordErrors,
	PasswordProvider,
	User,
	UserErrors,
	UserRepository,
} from "../../src";
import { Result } from "__SHARED_PACKAGE_NAME__";

const mockUserRepo: jest.Mocked<UserRepository> = {
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	findById: jest.fn(),
	findByEmail: jest.fn(),
};

const mockFindPassHash: jest.Mocked<FindPasswordHashQuery> = {
	execute: jest.fn(),
};

const mockPasswordProvider: jest.Mocked<PasswordProvider> = {
	hash: jest.fn(),
	compare: jest.fn(),
};

const user = User.create({
	id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
	name: "Test User",
	email: "test@example.com",
});

describe("LoginUseCase", () => {
	let useCase: LoginUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		useCase = new LoginUseCase(
			mockUserRepo,
			mockFindPassHash,
			mockPasswordProvider,
		);
	});

	test("should login successfully", async () => {
		mockUserRepo.findByEmail.mockResolvedValue(Result.ok(user));
		mockFindPassHash.execute.mockResolvedValue(Result.ok({ hash: "hash" }));
		mockPasswordProvider.compare.mockResolvedValue(true);

		const result = await useCase.execute({
			email: "test@example.com",
			password: "Password123!",
		});

		expect(result.isOk).toBe(true);
		expect(result.instance.email).toBe("test@example.com");
	});

	test("should fail when user is not found", async () => {
		mockUserRepo.findByEmail.mockResolvedValue(Result.fail(UserErrors.NOT_FOUND));

		const result = await useCase.execute({
			email: "missing@example.com",
			password: "Password123!",
		});

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe(UserErrors.NOT_FOUND);
	});

	test("should fail when password does not match", async () => {
		mockUserRepo.findByEmail.mockResolvedValue(Result.ok(user));
		mockFindPassHash.execute.mockResolvedValue(Result.ok({ hash: "hash" }));
		mockPasswordProvider.compare.mockResolvedValue(false);

		const result = await useCase.execute({
			email: "test@example.com",
			password: "wrong-password",
		});

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe(PasswordErrors.MISMATCH);
	});
});
