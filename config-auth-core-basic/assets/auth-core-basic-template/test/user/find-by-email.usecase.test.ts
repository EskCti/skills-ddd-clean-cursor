import { Result } from "__SHARED_PACKAGE_NAME__";
import {
	FindUserByEmailQuery,
	FindUserByEmailUseCase,
	UserDTO,
} from "../../src";

const mockFindByEmailQuery: jest.Mocked<FindUserByEmailQuery> = {
	execute: jest.fn(),
};

const userDto: UserDTO = {
	id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
	name: "Test User",
	email: "test@example.com",
	admin: false,
	avatarUrl: null,
};

describe("FindUserByEmailUseCase", () => {
	let useCase: FindUserByEmailUseCase;

	beforeEach(() => {
		jest.clearAllMocks();
		useCase = new FindUserByEmailUseCase(mockFindByEmailQuery);
	});

	test("should return user when query succeeds", async () => {
		mockFindByEmailQuery.execute.mockResolvedValue(Result.ok(userDto));

		const result = await useCase.execute(userDto.email);

		expect(result.isOk).toBe(true);
		expect(result.instance).toEqual(userDto);
		expect(mockFindByEmailQuery.execute).toHaveBeenCalledWith(userDto.email);
	});

	test("should propagate query error when user is not found", async () => {
		mockFindByEmailQuery.execute.mockResolvedValue(Result.fail("NOT_FOUND"));

		const result = await useCase.execute("missing@example.com");

		expect(result.isFailure).toBe(true);
		expect(result.errors?.[0]).toBe("NOT_FOUND");
	});
});
