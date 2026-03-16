import { DeleteUserUseCase, UserRepository, UserErrors } from "../../src";
import { Result } from "__SHARED_PACKAGE_NAME__";

const mockUserRepo: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    updateRoles: jest.fn(),
};

describe("DeleteUserUseCase", () => {
    let useCase: DeleteUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new DeleteUserUseCase(mockUserRepo);
    });

    it("should delete a user successfully", async () => {
        mockUserRepo.delete.mockResolvedValue(Result.ok());

        const result = await useCase.execute({ id: "user-id" });

        expect(result.isOk).toBe(true);
        expect(mockUserRepo.delete).toHaveBeenCalledWith("user-id");
    });

    it("should propagate repository failure", async () => {
        mockUserRepo.delete.mockResolvedValue(
            Result.fail(UserErrors.NOT_FOUND),
        );

        const result = await useCase.execute({ id: "missing-user" });

        expect(result.isFailure).toBe(true);
        expect(result.errors?.[0]).toBe(UserErrors.NOT_FOUND);
    });
});
