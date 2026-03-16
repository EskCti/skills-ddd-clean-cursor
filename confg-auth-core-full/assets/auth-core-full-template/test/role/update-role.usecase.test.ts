import { Result } from "__SHARED_PACKAGE_NAME__";
import {
    UpdateRoleUseCase,
    RoleRepository,
    PermissionsExistQuery,
} from "../../src";
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

describe("UpdateRoleUseCase", () => {
    let useCase: UpdateRoleUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new UpdateRoleUseCase(mockRoleRepo, mockPermissionChecker);
    });

    it("should fail when role is not found", async () => {
        mockRoleRepo.findById.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );

        const result = await useCase.execute({ id: ROLE_ID, name: "NewName" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(RoleErrors.NOT_FOUND);
    });

    it("should update name and description successfully", async () => {
        mockRoleRepo.findById.mockResolvedValue(Result.ok(existingRole));
        mockRoleRepo.update.mockResolvedValue(Result.ok(undefined as any));

        const result = await useCase.execute({
            id: ROLE_ID,
            name: "SuperAdmin",
            description: "New desc",
        });

        expect(result.isOk).toBe(true);
        expect(mockRoleRepo.update).toHaveBeenCalled();
    });

    it("should update permissions when checker succeeds", async () => {
        mockRoleRepo.findById.mockResolvedValue(Result.ok(existingRole));
        mockPermissionChecker.execute.mockResolvedValue(Result.ok(true));
        mockRoleRepo.update.mockResolvedValue(Result.ok(undefined as any));

        const result = await useCase.execute({
            id: ROLE_ID,
            permissionIds: [PERM_ID],
        });

        expect(result.isOk).toBe(true);
        expect(mockPermissionChecker.execute).toHaveBeenCalledWith([PERM_ID]);
    });

    it("should skip permission update when checker fails", async () => {
        mockRoleRepo.findById.mockResolvedValue(Result.ok(existingRole));
        mockPermissionChecker.execute.mockResolvedValue(
            Result.fail("PERM_NOT_FOUND"),
        );
        mockRoleRepo.update.mockResolvedValue(Result.ok(undefined as any));

        const result = await useCase.execute({
            id: ROLE_ID,
            permissionIds: [PERM_ID],
        });

        expect(result.isOk).toBe(true);
    });

    it("should propagate repo.update failure", async () => {
        mockRoleRepo.findById.mockResolvedValue(Result.ok(existingRole));
        mockRoleRepo.update.mockResolvedValue(Result.fail("DB_ERROR"));

        const result = await useCase.execute({ id: ROLE_ID, name: "NewName" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe("DB_ERROR");
    });
});
