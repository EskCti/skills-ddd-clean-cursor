import { Result } from "__SHARED_PACKAGE_NAME__";
import {
	FindUserByIdQuery,
	FindUserByIdUseCase,
	UserDTO,
} from "../../src";

const mockFindByIdQuery: jest.Mocked<FindUserByIdQuery> = {
	execute: jest.fn(),
};

const userDto: UserDTO = {
	id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
	name: "Test User",
	email: "test@example.com",
	admin: false,
	avatarUrl: null,
};

describe("FindUserByIdUseCase", () => {
	let useCase: FindUserByIdUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		useCase = new FindUserByIdUseCase(mockFindByIdQuery);
	});

	test("should return user when query succeeds", async () => {
		mockFindByIdQuery.execute.mockResolvedValue(Result.ok(userDto));

		const result = await useCase.execute(userDto.id!);

		expect(result.isOk).toBe(true);
		expect(result.instance).toEqual(userDto);
		expect(mockFindByIdQuery.execute).toHaveBeenCalledWith(userDto.id);
	});

	test("should propagate query error when user is not found", async () => {
		mockFindByIdQuery.execute.mockResolvedValue(Result.fail("NOT_FOUND"));

		const result = await useCase.execute(
			"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
		);

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("NOT_FOUND");
	});
});
