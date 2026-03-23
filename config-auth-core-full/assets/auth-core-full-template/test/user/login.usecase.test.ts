import {
  LoginUseCase,
  UserRepository,
  FindPasswordHashQuery,
  PasswordCryptoProvider,
  PasswordErrors,
  User,
  UserErrors,
} from "../../src";
import { Result } from "__SHARED_PACKAGE_NAME__";

const mockUserRepo: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByEmail: jest.fn(),
  updateRoles: jest.fn(),
};

const mockFindPassHash: jest.Mocked<FindPasswordHashQuery> = {
  execute: jest.fn(),
};

const mockPasswordProvider: jest.Mocked<PasswordCryptoProvider> = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const user = User.create({
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  name: "Test User",
  email: "test@example.com",
  roleIds: [],
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

  it("should login successfully", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(user));
    mockFindPassHash.execute.mockResolvedValue(Result.ok({ hash: "hash" }));
    mockPasswordProvider.compare.mockResolvedValue(true);

    const result = await useCase.execute({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.isOk).toBe(true);
    expect(result.instance.email).toBe("test@example.com");
    expect(mockPasswordProvider.compare).toHaveBeenCalledWith(
      "Password123!",
      "hash",
    );
  });

  it("should fail when user is not found", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.fail(UserErrors.NOT_FOUND));

    const result = await useCase.execute({
      email: "missing@example.com",
      password: "Password123!",
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe(UserErrors.NOT_FOUND);
  });

  it("should fail when password hash query fails", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(user));
    mockFindPassHash.execute.mockResolvedValue(Result.fail("PASS_NOT_FOUND"));

    const result = await useCase.execute({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe("PASS_NOT_FOUND");
  });

  it("should fail when password does not match", async () => {
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
