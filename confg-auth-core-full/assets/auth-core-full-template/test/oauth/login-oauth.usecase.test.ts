import { Result } from "__SHARED_PACKAGE_NAME__";
import { LoginOAuthUseCase } from "../../src/oauth/usecase/login-oauth.usecase";
import { UserRepository, FindUserByIdQuery, UserDTO } from "../../src/user";
import { UserErrors } from "../../src/user/errors";
import { RoleRepository } from "../../src/role";
import { RoleErrors } from "../../src/role/errors";
import {
    OAuthAccountRepository,
    OAuthProvider,
} from "../../src/oauth/provider";
import { OAuthErrors } from "../../src/oauth/errors";
import { OAuthIdentityDTO } from "../../src/oauth/dto";
import { OAuthIdentityProvider } from "../../src/oauth/model/oauth-provider.enum";
import { Role } from "../../src/role/model/role.entity";

const USER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const ROLE_ID = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

const mockUserRepo: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    updateRoles: jest.fn(),
};

const mockFindUserByIdQuery: jest.Mocked<FindUserByIdQuery> = {
    execute: jest.fn(),
};

const mockRoleRepo: jest.Mocked<RoleRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
};

const mockOAuthRepo: jest.Mocked<OAuthAccountRepository> = {
    findByProviderAccount: jest.fn(),
    create: jest.fn(),
};

const mockOAuthProvider: jest.Mocked<OAuthProvider> = {
    getAuthorizationUrl: jest.fn(),
    getIdentityFromCode: jest.fn(),
};

const identity: OAuthIdentityDTO = {
    provider: OAuthIdentityProvider.GOOGLE,
    providerUserId: "google-uid-123",
    email: "oauth@example.com",
    emailVerified: true,
    name: "OAuth User",
};

const userDto: UserDTO = {
    id: USER_ID,
    name: "OAuth User",
    email: "oauth@example.com",
    roles: [],
    permissions: [],
};

const linkedAccount = {
    userId: USER_ID,
    provider: OAuthIdentityProvider.GOOGLE,
    providerUserId: "google-uid-123",
};

const defaultRole = Role.create({
    id: ROLE_ID,
    name: "colaborador",
    description: "Default",
    permissionIds: [],
});

describe("LoginOAuthUseCase", () => {
    let useCase: LoginOAuthUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new LoginOAuthUseCase(
            mockUserRepo,
            mockFindUserByIdQuery,
            mockRoleRepo,
            mockOAuthRepo,
            mockOAuthProvider,
        );
    });

    it("should fail with INVALID_CALLBACK_CODE when code is empty", async () => {
        const result = await useCase.execute({ code: "" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(OAuthErrors.INVALID_CALLBACK_CODE);
    });

    it("should propagate failure when getIdentityFromCode fails", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.fail(OAuthErrors.PROVIDER_MISCONFIGURED),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(OAuthErrors.PROVIDER_MISCONFIGURED);
    });

    it("should fail when identity has no email", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok({ ...identity, email: "" }),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(OAuthErrors.EMAIL_NOT_AVAILABLE);
    });

    it("should fail when email is not verified", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok({ ...identity, emailVerified: false }),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(OAuthErrors.EMAIL_NOT_VERIFIED);
    });

    it("should return existing user when linked account is found", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.ok(linkedAccount as any),
        );
        mockFindUserByIdQuery.execute.mockResolvedValue(Result.ok(userDto));

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isOk).toBe(true);
        expect(result.instance.email).toBe("oauth@example.com");
        expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it("should propagate failure from findUserByIdQuery when linked account found", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.ok(linkedAccount as any),
        );
        mockFindUserByIdQuery.execute.mockResolvedValue(
            Result.fail("USER_QUERY_ERROR"),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("USER_QUERY_ERROR");
    });

    it("should propagate non-ACCOUNT_NOT_FOUND error from oauthRepo.findByProviderAccount", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.fail("OAUTH_DB_ERROR"),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("OAUTH_DB_ERROR");
    });

    it("should create and link new user when account not found and email not registered", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.fail(OAuthErrors.ACCOUNT_NOT_FOUND),
        );
        mockUserRepo.findByEmail.mockResolvedValue(
            Result.fail(UserErrors.NOT_FOUND),
        );
        mockRoleRepo.findByName.mockResolvedValue(Result.ok(defaultRole));
        mockUserRepo.create.mockResolvedValue(Result.ok(undefined as any));
        mockUserRepo.findByEmail
            .mockResolvedValueOnce(Result.fail(UserErrors.NOT_FOUND))
            .mockResolvedValueOnce(
                Result.ok({ id: USER_ID, email: identity.email } as any),
            );
        mockOAuthRepo.create.mockResolvedValue(Result.ok(undefined as any));
        mockFindUserByIdQuery.execute.mockResolvedValue(Result.ok(userDto));

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isOk).toBe(true);
        expect(mockUserRepo.create).toHaveBeenCalled();
        expect(mockOAuthRepo.create).toHaveBeenCalled();
    });

    it("should return existing user when account not found but email already registered", async () => {
        const existingUser = { id: USER_ID, email: identity.email } as any;

        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.fail(OAuthErrors.ACCOUNT_NOT_FOUND),
        );
        mockUserRepo.findByEmail.mockResolvedValue(Result.ok(existingUser));
        mockOAuthRepo.create.mockResolvedValue(Result.ok(undefined as any));
        mockFindUserByIdQuery.execute.mockResolvedValue(Result.ok(userDto));

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isOk).toBe(true);
        expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when role not found during new user creation", async () => {
        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.fail(OAuthErrors.ACCOUNT_NOT_FOUND),
        );
        mockUserRepo.findByEmail.mockResolvedValue(
            Result.fail(UserErrors.NOT_FOUND),
        );
        mockRoleRepo.findByName.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(RoleErrors.NOT_FOUND);
    });

    it("should fail when oauthRepo.create fails", async () => {
        const existingUser = { id: USER_ID, email: identity.email } as any;

        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.fail(OAuthErrors.ACCOUNT_NOT_FOUND),
        );
        mockUserRepo.findByEmail.mockResolvedValue(Result.ok(existingUser));
        mockOAuthRepo.create.mockResolvedValue(Result.fail("LINK_ERROR"));

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("LINK_ERROR");
    });

    it("should fail when findUserByIdQuery fails at the end", async () => {
        const existingUser = { id: USER_ID, email: identity.email } as any;

        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok(identity),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.fail(OAuthErrors.ACCOUNT_NOT_FOUND),
        );
        mockUserRepo.findByEmail.mockResolvedValue(Result.ok(existingUser));
        mockOAuthRepo.create.mockResolvedValue(Result.ok(undefined as any));
        mockFindUserByIdQuery.execute.mockResolvedValue(
            Result.fail("DTO_QUERY_ERROR"),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("DTO_QUERY_ERROR");
    });

    it("should resolve name from email when identity has no name", async () => {
        const emailWithDots = "john.doe@example.com";
        const createdUser = { id: USER_ID, email: emailWithDots } as any;

        mockOAuthProvider.getIdentityFromCode.mockResolvedValue(
            Result.ok({ ...identity, email: emailWithDots, name: undefined }),
        );
        mockOAuthRepo.findByProviderAccount.mockResolvedValue(
            Result.fail(OAuthErrors.ACCOUNT_NOT_FOUND),
        );
        mockUserRepo.findByEmail
            .mockResolvedValueOnce(Result.fail(UserErrors.NOT_FOUND))
            .mockResolvedValueOnce(Result.ok(createdUser));
        mockRoleRepo.findByName.mockResolvedValue(Result.ok(defaultRole));
        mockUserRepo.create.mockResolvedValue(Result.ok(undefined as any));
        mockOAuthRepo.create.mockResolvedValue(Result.ok(undefined as any));
        mockFindUserByIdQuery.execute.mockResolvedValue(
            Result.ok({ ...userDto, email: emailWithDots }),
        );

        const result = await useCase.execute({ code: "valid-code" });

        expect(result.isOk).toBe(true);
        const createCall = mockUserRepo.create.mock.calls[0][0];
        expect(createCall.name).toBeDefined();
        expect(typeof createCall.name).toBe("string");
    });
});
