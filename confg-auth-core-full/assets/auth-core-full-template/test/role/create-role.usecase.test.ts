import { Result } from "__SHARED_PACKAGE_NAME__";
import { CreateRole, RoleRepository, PermissionsExistQuery } from "../../src";
import { RoleErrors } from "../../src/role/errors";
import { Role } from "../../src/role/model/role.entity";

const ROLE_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const PERM_ID = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

const mockRoleRepo: jest.Mocked<RoleRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
};

const mockPermissionChecker: jest.Mocked<PermissionsExistQuery> = {
    execute: jest.fn(),
};

const existingRole = Role.create({
    id: ROLE_ID,
    name: "Admin",
    description: "Administrator",
    permissionIds: [],
});

describe("CreateRole", () => {
    let useCase: CreateRole;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new CreateRole(mockRoleRepo, mockPermissionChecker);
    });

    it("should fail when role name already exists", async () => {
        mockRoleRepo.findByName.mockResolvedValue(Result.ok(existingRole));

        const result = await useCase.execute({
            name: "Admin",
            description: "desc",
            permissionIds: [],
        });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(RoleErrors.NAME_ALREADY_EXISTS);
        expect(mockRoleRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when permissions do not exist", async () => {
        mockRoleRepo.findByName.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );
        mockPermissionChecker.execute.mockResolvedValue(
            Result.fail("PERMISSION_NOT_FOUND"),
        );

        const result = await useCase.execute({
            name: "Editor",
            description: "desc",
            permissionIds: [PERM_ID],
        });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("PERMISSION_NOT_FOUND");
    });

    it("should fail when role entity creation fails (invalid name)", async () => {
        mockRoleRepo.findByName.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );

        const result = await useCase.execute({
            name: "",
            description: "desc",
            permissionIds: [],
        });

        expect(result.isFailure).toBe(true);
    });

    it("should fail when repo.create fails", async () => {
        mockRoleRepo.findByName.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );
        mockRoleRepo.create.mockResolvedValue(Result.fail("DB_ERROR"));

        const result = await useCase.execute({
            name: "Editor",
            description: "desc",
            permissionIds: [],
        });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("DB_ERROR");
    });

    it("should create a role successfully without permissions", async () => {
        mockRoleRepo.findByName.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );
        mockRoleRepo.create.mockResolvedValue(Result.ok(undefined as any));

        const result = await useCase.execute({
            name: "Editor",
            description: "desc",
            permissionIds: [],
        });

        expect(result.isOk).toBe(true);
        expect(mockPermissionChecker.execute).not.toHaveBeenCalled();
    });

    it("should create a role successfully with valid permissions", async () => {
        mockRoleRepo.findByName.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );
        mockPermissionChecker.execute.mockResolvedValue(Result.ok(true));
        mockRoleRepo.create.mockResolvedValue(Result.ok(undefined as any));

        const result = await useCase.execute({
            name: "Editor",
            description: "desc",
            permissionIds: [PERM_ID],
        });

        expect(result.isOk).toBe(true);
        expect(mockPermissionChecker.execute).toHaveBeenCalledWith([PERM_ID]);
    });
});
