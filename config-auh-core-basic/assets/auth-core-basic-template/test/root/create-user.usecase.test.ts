import { Result } from "__SHARED_PACKAGE_NAME__";
import {
	CreateUserUseCase,
	Password,
	PasswordProvider,
	PasswordRepository,
	PasswordStatus,
	User,
	UserErrors,
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
	findByUserId: jest.fn(),
};

const mockPasswordProvider: jest.Mocked<PasswordProvider> = {
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
			mockPasswordProvider,
		);
	});

	test("should fail when email already exists", async () => {
		mockUserRepo.findByEmail.mockResolvedValue(
			Result.ok(
				User.create({
					id: USER_ID,
					name: validInput.name,
					email: validInput.email,
				}),
			),
		);

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe(UserErrors.EMAIL_ALREADY_EXISTS);
	});

	test("should propagate non-NOT_FOUND error from findByEmail", async () => {
		mockUserRepo.findByEmail.mockResolvedValue(Result.fail("DB_ERROR"));

		const result = await useCase.execute(validInput);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("DB_ERROR");
	});

	test("should create user successfully", async () => {
		mockUserRepo.findByEmail
			.mockResolvedValueOnce(Result.fail(UserErrors.NOT_FOUND))
			.mockResolvedValueOnce(
				Result.ok(
					User.create({
						id: USER_ID,
						name: validInput.name,
						email: validInput.email,
					}),
				),
			);
		mockPasswordProvider.hash.mockResolvedValue(HASHED_PASSWORD);
		mockUserRepo.create.mockResolvedValue(Result.ok());
		mockPassRepo.create.mockResolvedValue(
			Result.ok(
				Password.create({
					content: HASHED_PASSWORD,
					status: PasswordStatus.ACTIVE,
				}),
			),
		);

		const result = await useCase.execute(validInput);

		expect(result.isOk).toBe(true);
		expect(mockPasswordProvider.hash).toHaveBeenCalledWith(validInput.password);
		expect(mockPassRepo.create).toHaveBeenCalledTimes(1);
	});
});
