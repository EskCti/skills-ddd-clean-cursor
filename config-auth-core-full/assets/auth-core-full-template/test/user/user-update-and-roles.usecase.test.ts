import {
  AssignRolesToUserUseCase,
  RolesExistence,
  UpdateProfileUseCase,
  UpdateUserUseCase,
  User,
  UserErrors,
  UserRepository,
} from "../../src";
import { Result } from "__SHARED_PACKAGE_NAME__";

const user = User.create({
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  name: "Test User",
  email: "test@example.com",
  roleIds: [],
});

const mockUserRepo: jest.Mocked<UserRepository> = {
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByEmail: jest.fn(),
  updateRoles: jest.fn(),
};

const mockRolesExistence: jest.Mocked<RolesExistence> = {
  exists: jest.fn(),
};

describe("UpdateProfileUseCase", () => {
  let useCase: UpdateProfileUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateProfileUseCase(mockUserRepo);
  });

  it("should update profile successfully", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockUserRepo.update.mockResolvedValue(Result.ok());

    const result = await useCase.execute({ id: user.id, name: "Valid Name" });

    expect(result.isOk).toBe(true);
    expect(mockUserRepo.update).toHaveBeenCalled();
  });

  it("should fail when user does not exist", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.fail(UserErrors.NOT_FOUND));

    const result = await useCase.execute({ id: "missing", name: "Valid Name" });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe(UserErrors.NOT_FOUND);
  });
});

describe("UpdateUserUseCase", () => {
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateUserUseCase(mockUserRepo);
  });

  it("should update user successfully", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockUserRepo.update.mockResolvedValue(Result.ok());

    const result = await useCase.execute({
      id: user.id,
      name: "Valid Name",
      email: "updated@example.com",
    });

    expect(result.isOk).toBe(true);
    expect(mockUserRepo.update).toHaveBeenCalled();
  });

  it("should fail when payload is invalid", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));

    const result = await useCase.execute({
      id: user.id,
      name: "invalid",
      email: "invalid-email",
    });

    expect(result.isFailure).toBe(true);
  });
});

describe("AssignRolesToUserUseCase", () => {
  let useCase: AssignRolesToUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AssignRolesToUserUseCase(mockUserRepo, mockRolesExistence);
  });

  it("should assign roles successfully", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockRolesExistence.exists.mockResolvedValue(Result.ok(true));
    mockUserRepo.updateRoles.mockResolvedValue(Result.ok());

    const result = await useCase.execute({
      userId: user.id,
      roleIds: ["role-1", "role-2"],
    });

    expect(result.isOk).toBe(true);
    expect(mockUserRepo.updateRoles).toHaveBeenCalledWith(user.id, [
      "role-1",
      "role-2",
    ]);
  });

  it("should fail when user does not exist", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.fail(UserErrors.NOT_FOUND));

    const result = await useCase.execute({
      userId: "missing",
      roleIds: ["role-1"],
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe(UserErrors.NOT_FOUND);
  });

  it("should fail when roles check fails", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockRolesExistence.exists.mockResolvedValue(Result.fail("ROLES_CHECK_FAILED"));

    const result = await useCase.execute({
      userId: user.id,
      roleIds: ["role-1"],
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe("ROLES_CHECK_FAILED");
  });

  it("should fail when update roles fails", async () => {
    mockUserRepo.findById.mockResolvedValue(Result.ok(user));
    mockRolesExistence.exists.mockResolvedValue(Result.ok(true));
    mockUserRepo.updateRoles.mockResolvedValue(Result.fail("UPDATE_FAILED"));

    const result = await useCase.execute({
      userId: user.id,
      roleIds: ["role-1"],
    });

    expect(result.isFailure).toBe(true);
    expect(result.errors?.[0]).toBe("UPDATE_FAILED");
  });
});
