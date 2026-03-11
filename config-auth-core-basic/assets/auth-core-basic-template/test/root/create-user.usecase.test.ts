import { Result } from "__SHARED_PACKAGE_NAME__";
import {
	CreateUserUseCase,
	Password,
	PasswordCryptoProvider,
	PasswordRepository,
	User,
	UserErrors,
	UserExistsQuery,
	UserRepository,
} from "../../src";

const USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const HASHED_PASSWORD =
	"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

const mockUserRepo: jest.Mocked<UserRepository> = {
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	findById: jest.fn(),
	findByEmail: jest.fn(),
};

const mockPassRepo: jest.Mocked<PasswordRepository> = {
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	findById: jest.fn(),
	findActiveByUserId: jest.fn(),
	findRecentByUserId: jest.fn(),
};

const mockUserExistsQuery: jest.Mocked<UserExistsQuery> = {
	execute: jest.fn(),
};

const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
	hash: jest.fn(),
	compare: jest.fn(),
};

const validInput = {
	name: "Joao Silva",
	email: "joao@example.com",
	password: "StrongPass1!",
};

describe("CreateUserUseCase", () => {
	let useCase: CreateUserUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		useCase = new CreateUserUseCase(
			mockUserRepo,
			mockPassRepo,
			mockUserExistsQuery,
			mockPasswordCryptoProvider,
		);
	});

	test("should fail when email already exists", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.ok(true));

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe(UserErrors.EMAIL_ALREADY_EXISTS);
		expect(mockUserExistsQuery.execute).toHaveBeenCalledWith({
			email: validInput.email,
		});
	});

	test("should propagate error from user exists query", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.fail("DB_ERROR"));

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("DB_ERROR");
	});

	test("should create user successfully", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
		mockUserRepo.findByEmail.mockResolvedValue(
			Result.ok(
				User.create({
					id: USER_ID,
					name: validInput.name,
					email: validInput.email,
				}),
			),
		);
		mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);
		mockUserRepo.create.mockResolvedValue(Result.ok());
		mockPassRepo.create.mockResolvedValue(
			Result.ok(
				Password.create({
					content: HASHED_PASSWORD,
				}),
			),
		);

		const result = await useCase.execute(validInput);

		expect(result.isOk).toBe(true);
		expect(mockPasswordCryptoProvider.hash).toHaveBeenCalledWith(validInput.password);
		expect(mockPassRepo.create).toHaveBeenCalledTimes(1);
	});

	test("should fail when password entity creation fails", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
		mockPasswordCryptoProvider.hash.mockResolvedValue("invalid-hash");

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(mockUserRepo.create).not.toHaveBeenCalled();
		expect(mockPassRepo.create).not.toHaveBeenCalled();
	});

	test("should fail when user entity creation fails", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
		mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);

		const result = await useCase.execute({
			...validInput,
			name: "",
		});

		expect(result.isFailure).toBe(true);
		expect(mockUserRepo.create).not.toHaveBeenCalled();
		expect(mockPassRepo.create).not.toHaveBeenCalled();
	});

	test("should fail when user repository create fails", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
		mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);
		mockUserRepo.create.mockResolvedValue(Result.fail("CREATE_USER_ERROR"));

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("CREATE_USER_ERROR");
	});

	test("should fail when created user cannot be reloaded", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
		mockUserRepo.findByEmail.mockResolvedValue(Result.fail("RELOAD_USER_ERROR"));
		mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);
		mockUserRepo.create.mockResolvedValue(Result.ok());

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("RELOAD_USER_ERROR");
	});

	test("should fail when password repository create fails", async () => {
		mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
		mockUserRepo.findByEmail.mockResolvedValue(
			Result.ok(
				User.create({
					id: USER_ID,
					name: validInput.name,
					email: validInput.email,
				}),
			),
		);
		mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);
		mockUserRepo.create.mockResolvedValue(Result.ok());
		mockPassRepo.create.mockResolvedValue(Result.fail("CREATE_PASSWORD_ERROR"));

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("CREATE_PASSWORD_ERROR");
	});
});
