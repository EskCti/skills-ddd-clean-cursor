import { Result } from "__SHARED_PACKAGE_NAME__";
import { DeleteRoleUseCase, RoleRepository } from "../../src";
import { RoleErrors } from "../../src/role/errors";

const ROLE_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

const mockRoleRepo: jest.Mocked<RoleRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
};

describe("DeleteRoleUseCase", () => {
    let useCase: DeleteRoleUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new DeleteRoleUseCase(mockRoleRepo);
    });

    it("should delete a role successfully", async () => {
        mockRoleRepo.delete.mockResolvedValue(Result.ok(undefined as any));

        const result = await useCase.execute({ id: ROLE_ID });

        expect(result.isOk).toBe(true);
        expect(mockRoleRepo.delete).toHaveBeenCalledWith(ROLE_ID);
    });

    it("should propagate repository failure", async () => {
        mockRoleRepo.delete.mockResolvedValue(
            Result.fail(RoleErrors.NOT_FOUND),
        );

        const result = await useCase.execute({ id: ROLE_ID });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(RoleErrors.NOT_FOUND);
    });
});
