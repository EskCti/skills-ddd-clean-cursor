import { Result } from "__SHARED_PACKAGE_NAME__";
import {
    ChangePasswordIn,
    ChangePasswordUseCase,
    Password,
    PasswordCryptoProvider,
    PasswordErrors,
    PasswordRepository,
    UserExistsQuery,
} from "../../src";

const USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const NEW_PLAIN_PASSWORD = "NewPassword123!";
const VALID_HASH =
    "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
const ANOTHER_VALID_HASH =
    "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWx";

describe("ChangePasswordUseCase", () => {
    let useCase: ChangePasswordUseCase;
    let mockPassRepo: jest.Mocked<PasswordRepository>;
    let mockUserExistsQuery: jest.Mocked<UserExistsQuery>;
    let mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider>;

    const input: ChangePasswordIn = {
        userId: USER_ID,
        oldPassword: "OldPassword123!",
        newPassword: NEW_PLAIN_PASSWORD,
        confirmPassword: NEW_PLAIN_PASSWORD,
    };

    beforeEach(() => {
        mockPassRepo = {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findById: jest.fn(),
            findActiveByUserId: jest.fn(),
            findRecentByUserId: jest.fn(),
            findByUserId: jest.fn(),
        };

        mockUserExistsQuery = {
            execute: jest.fn(),
        };

        mockPasswordCryptoProvider = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        useCase = new ChangePasswordUseCase(
            mockPassRepo,
            mockUserExistsQuery,
            mockPasswordCryptoProvider,
        );

        mockUserExistsQuery.execute.mockResolvedValue(Result.ok(true));
        mockPassRepo.findRecentByUserId.mockResolvedValue(
            Result.ok([Password.create({ content: VALID_HASH })]),
        );
        mockPasswordCryptoProvider.compare.mockResolvedValue(false);
        mockPasswordCryptoProvider.hash.mockResolvedValue(ANOTHER_VALID_HASH);
        mockPassRepo.create.mockResolvedValue(Result.ok());
    });

    test("should propagate failure when userExistsQuery fails", async () => {
        mockUserExistsQuery.execute.mockResolvedValue(Result.fail("USER_QUERY_ERROR"));

        const result = await useCase.execute(input);

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("USER_QUERY_ERROR");
        expect(mockPassRepo.findRecentByUserId).not.toHaveBeenCalled();
    });

    test("should fail with INVALID_USER when query returns false", async () => {
        mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));

        const result = await useCase.execute(input);

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(PasswordErrors.INVALID_USER);
        expect(mockPassRepo.findRecentByUserId).not.toHaveBeenCalled();
    });

    test("should propagate failure when finding recent passwords fails", async () => {
        mockPassRepo.findRecentByUserId.mockResolvedValue(
            Result.fail("RECENT_PASSWORDS_ERROR"),
        );

        const result = await useCase.execute(input);

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("RECENT_PASSWORDS_ERROR");
        expect(mockPasswordCryptoProvider.hash).not.toHaveBeenCalled();
    });

    test("should fail when password policy validation fails", async () => {
        const result = await useCase.execute({
            ...input,
            confirmPassword: "MismatchPassword123!",
        });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(PasswordErrors.MISMATCH);
        expect(mockPasswordCryptoProvider.hash).not.toHaveBeenCalled();
        expect(mockPassRepo.create).not.toHaveBeenCalled();
    });

    test("should fail when hashed password cannot create Password entity", async () => {
        mockPasswordCryptoProvider.hash.mockResolvedValue("invalid-hash");

        const result = await useCase.execute(input);

        expect(result.isFailure).toBe(true);
        expect(mockPassRepo.create).not.toHaveBeenCalled();
    });

    test("should return create failure when persist new password fails", async () => {
        mockPassRepo.create.mockResolvedValue(Result.fail("CREATE_PASSWORD_ERROR"));

        const result = await useCase.execute(input);

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("CREATE_PASSWORD_ERROR");
        expect(mockPassRepo.create).toHaveBeenCalledTimes(1);
    });

    test("should create password successfully", async () => {
        const result = await useCase.execute(input);

        expect(result.isOk).toBe(true);
        expect(mockUserExistsQuery.execute).toHaveBeenCalledWith({ id: USER_ID });
        expect(mockPassRepo.findRecentByUserId).toHaveBeenCalledWith(USER_ID, 5);
        expect(mockPasswordCryptoProvider.hash).toHaveBeenCalledWith(
            NEW_PLAIN_PASSWORD,
        );
        expect(mockPassRepo.create).toHaveBeenCalledTimes(1);
    });
});
