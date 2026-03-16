import { Result, TransactionManager } from "__SHARED_PACKAGE_NAME__";
import {
    CreateUserUseCase,
    PasswordCryptoProvider,
    PasswordRepository,
    UserErrors,
    UserExistsQuery,
    UserRepository,
} from "../../src";

const HASHED_PASSWORD =
    "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

const mockUserRepo: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    updateRoles: jest.fn(),
};

const mockPassRepo: jest.Mocked<PasswordRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findActiveByUserId: jest.fn(),
    findRecentByUserId: jest.fn(),
    findByUserId: jest.fn(),
};

const mockUserExistsQuery: jest.Mocked<UserExistsQuery> = {
    execute: jest.fn(),
};

const mockPasswordCryptoProvider: jest.Mocked<PasswordCryptoProvider> = {
    hash: jest.fn(),
    compare: jest.fn(),
};

const mockTransactionManager: jest.Mocked<TransactionManager> = {
    runInTransaction: jest.fn(),
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
        mockTransactionManager.runInTransaction.mockImplementation(
            async (operation) => operation({}),
        );
        useCase = new CreateUserUseCase(
            mockUserRepo,
            mockPassRepo,
            mockUserExistsQuery,
            mockPasswordCryptoProvider,
            mockTransactionManager,
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
        mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);
        mockUserRepo.create.mockResolvedValue(Result.ok());
        mockPassRepo.create.mockResolvedValue(Result.ok());

        const result = await useCase.execute(validInput);

        expect(result.isOk).toBe(true);
        expect(mockPasswordCryptoProvider.hash).toHaveBeenCalledWith(
            validInput.password,
        );
        expect(mockTransactionManager.runInTransaction).toHaveBeenCalledTimes(1);
        expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
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

    test("should fail when transaction manager fails", async () => {
        mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
        mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);
        mockTransactionManager.runInTransaction.mockRejectedValue(
            new Error("TRANSACTION_ERROR"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("TRANSACTION_ERROR");
    });

    test("should fail when password repository create fails", async () => {
        mockUserExistsQuery.execute.mockResolvedValue(Result.ok(false));
        mockPasswordCryptoProvider.hash.mockResolvedValue(HASHED_PASSWORD);
        mockUserRepo.create.mockResolvedValue(Result.ok());
        mockPassRepo.create.mockResolvedValue(Result.fail("CREATE_PASSWORD_ERROR"));

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("CREATE_PASSWORD_ERROR");
    });
});
