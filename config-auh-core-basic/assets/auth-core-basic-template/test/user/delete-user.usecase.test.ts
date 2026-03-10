import { Result } from "__SHARED_PACKAGE_NAME__";
import { DeleteUserUseCase, UserRepository } from "../../src";

const mockUserRepo: jest.Mocked<UserRepository> = {
	create: jest.fn(),
	update: jest.fn(),
	delete: jest.fn(),
	findById: jest.fn(),
	findByEmail: jest.fn(),
};

describe("DeleteUserUseCase", () => {
	let useCase: DeleteUserUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		useCase = new DeleteUserUseCase(mockUserRepo);
	});

	test("should delete user successfully", async () => {
		const userId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
		mockUserRepo.delete.mockResolvedValue(Result.ok());

		const result = await useCase.execute({ id: userId });

		expect(result.isOk).toBe(true);
		expect(mockUserRepo.delete).toHaveBeenCalledWith(userId);
	});

	test("should propagate repository error when delete fails", async () => {
		const userId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
		mockUserRepo.delete.mockResolvedValue(Result.fail("DELETE_USER_ERROR"));

		const result = await useCase.execute({ id: userId });

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("DELETE_USER_ERROR");
	});
});
