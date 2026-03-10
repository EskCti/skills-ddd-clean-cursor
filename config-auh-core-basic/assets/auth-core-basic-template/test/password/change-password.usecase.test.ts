import {
	ChangePasswordIn,
	ChangePasswordUseCase,
	Password,
	PasswordErrors,
	PasswordProvider,
	PasswordRepository,
	PasswordStatus,
	User,
	UserErrors,
	UserRepository,
} from "../../src";
import { Result } from "__SHARED_PACKAGE_NAME__";

const mockPasswordProvider: jest.Mocked<PasswordProvider> = {
	hash: jest.fn(),
	compare: jest.fn(),
};

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

const USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const OLD_PLAIN_PASSWORD = "OldPassword123!";
const NEW_PLAIN_PASSWORD = "NewPassword123!";
const OLD_HASHED_PASSWORD =
	"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
const NEW_HASHED_PASSWORD =
	"$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWx";

const user = User.create({
	id: USER_ID,
	name: "Test User",
	email: "test@example.com",
});

describe("ChangePasswordUseCase", () => {
	let useCase: ChangePasswordUseCase;
	let oldPasswordEntity: Password;

	beforeEach(() => {
		jest.clearAllMocks();

		useCase = new ChangePasswordUseCase(
			mockUserRepo,
			mockPassRepo,
			mockPasswordProvider,
		);

		oldPasswordEntity = Password.create({
			content: OLD_HASHED_PASSWORD,
			status: PasswordStatus.ACTIVE,
		});

		mockPasswordProvider.hash.mockResolvedValue(NEW_HASHED_PASSWORD);
		mockPasswordProvider.compare.mockResolvedValue(true);
	});

	test("should change password successfully", async () => {
		const input: ChangePasswordIn = {
			userId: USER_ID,
			oldPassword: OLD_PLAIN_PASSWORD,
			newPassword: NEW_PLAIN_PASSWORD,
			confirmPassword: NEW_PLAIN_PASSWORD,
		};

		mockUserRepo.findById.mockResolvedValue(Result.ok(user));
		mockPassRepo.findByUserId.mockResolvedValue(Result.ok(oldPasswordEntity));
		mockPassRepo.update.mockResolvedValue(Result.ok());
		mockPassRepo.create.mockResolvedValue(
			Result.ok(
				Password.create({
					content: NEW_HASHED_PASSWORD,
					status: PasswordStatus.ACTIVE,
				}),
			),
		);

		const result = await useCase.execute(input);

		expect(result.isOk).toBe(true);
		expect(mockPasswordProvider.hash).toHaveBeenCalledWith(NEW_PLAIN_PASSWORD);
		expect(mockPassRepo.create).toHaveBeenCalledTimes(1);
	});

	test("should fail if new passwords do not match", async () => {
		const input: ChangePasswordIn = {
			userId: USER_ID,
			oldPassword: OLD_PLAIN_PASSWORD,
			newPassword: NEW_PLAIN_PASSWORD,
			confirmPassword: "wrong-password",
		};

		const result = await useCase.execute(input);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe(PasswordErrors.MISMATCH);
	});

	test("should fail if user not found", async () => {
		const input: ChangePasswordIn = {
			userId: USER_ID,
			oldPassword: OLD_PLAIN_PASSWORD,
			newPassword: NEW_PLAIN_PASSWORD,
			confirmPassword: NEW_PLAIN_PASSWORD,
		};

		mockUserRepo.findById.mockResolvedValue(Result.fail(UserErrors.NOT_FOUND));

		const result = await useCase.execute(input);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe(UserErrors.NOT_FOUND);
	});

	test("should fail if old password does not match", async () => {
		const input: ChangePasswordIn = {
			userId: USER_ID,
			oldPassword: "wrong-old-password",
			newPassword: NEW_PLAIN_PASSWORD,
			confirmPassword: NEW_PLAIN_PASSWORD,
		};

		mockUserRepo.findById.mockResolvedValue(Result.ok(user));
		mockPassRepo.findByUserId.mockResolvedValue(Result.ok(oldPasswordEntity));
		mockPasswordProvider.compare.mockResolvedValue(false);

		const result = await useCase.execute(input);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe(PasswordErrors.MISMATCH);
	});
});
