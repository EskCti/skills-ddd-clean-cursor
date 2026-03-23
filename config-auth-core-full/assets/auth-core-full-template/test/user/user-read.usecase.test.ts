import {
  FindAllUsersUseCase,
  FindUserByEmailUseCase,
  FindUserByIdUseCase,
  FindAllUsersQuery,
  FindUserByEmailQuery,
  FindUserByIdQuery,
  UserDTO,
} from "../../src";
import { Result } from "__SHARED_PACKAGE_NAME__";

const userDto: UserDTO = {
  id: "u1",
  name: "Test User",
  email: "test@example.com",
  avatarUrl: null,
  roles: [],
  permissions: [],
};

describe("User read use cases", () => {
  it("should return user by id", async () => {
    const findById: jest.Mocked<FindUserByIdQuery> = {
      execute: jest.fn().mockResolvedValue(Result.ok(userDto)),
    };

    const useCase = new FindUserByIdUseCase(findById);
    const result = await useCase.execute("u1");

    expect(result.isOk).toBe(true);
    expect(result.instance.id).toBe("u1");
  });

  it("should propagate error when find by id fails", async () => {
    const findById: jest.Mocked<FindUserByIdQuery> = {
      execute: jest.fn().mockResolvedValue(Result.fail("USER_NOT_FOUND")),
    };

    const useCase = new FindUserByIdUseCase(findById);
    const result = await useCase.execute("missing");

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe("USER_NOT_FOUND");
  });

  it("should return user by email", async () => {
    const findByEmail: jest.Mocked<FindUserByEmailQuery> = {
      execute: jest.fn().mockResolvedValue(Result.ok(userDto)),
    };

    const useCase = new FindUserByEmailUseCase(findByEmail);
    const result = await useCase.execute("test@example.com");

    expect(result.isOk).toBe(true);
    expect(result.instance.email).toBe("test@example.com");
  });

  it("should propagate error when find by email fails", async () => {
    const findByEmail: jest.Mocked<FindUserByEmailQuery> = {
      execute: jest.fn().mockResolvedValue(Result.fail("USER_NOT_FOUND")),
    };

    const useCase = new FindUserByEmailUseCase(findByEmail);
    const result = await useCase.execute("missing@example.com");

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe("USER_NOT_FOUND");
  });

  it("should return paginated users from query", async () => {
    const out = {
      data: [userDto],
      meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    };

    const findAll: jest.Mocked<FindAllUsersQuery> = {
      execute: jest.fn().mockResolvedValue(Result.ok(out)),
    };

    const useCase = new FindAllUsersUseCase(findAll);
    const result = await useCase.execute({ page: 1, pageSize: 10 });

    expect(result.isOk).toBe(true);
    expect(result.instance.meta.total).toBe(1);
  });

  it("should fallback to empty pagination when query fails", async () => {
    const findAll: jest.Mocked<FindAllUsersQuery> = {
      execute: jest.fn().mockResolvedValue(Result.fail("INTERNAL")),
    };

    const useCase = new FindAllUsersUseCase(findAll);
    const result = await useCase.execute({ page: 3, pageSize: 25 });

    expect(result.isOk).toBe(true);
    expect(result.instance.data).toEqual([]);
    expect(result.instance.meta).toEqual({
      page: 3,
      pageSize: 25,
      total: 0,
      totalPages: 0,
    });
  });
});
