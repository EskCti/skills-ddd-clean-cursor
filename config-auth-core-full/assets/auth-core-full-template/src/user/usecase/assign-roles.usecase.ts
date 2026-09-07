import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { UserErrors } from "../errors";
import { RolesExistence, UserRepository } from "../provider";

export interface AssignRolesToUserIn {
  userId: string;
  roleIds: string[];
}

export class AssignRolesToUserUseCase implements UseCase<AssignRolesToUserIn, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly rolesChecker: RolesExistence,
  ) {}

  async execute(data: AssignRolesToUserIn): Promise<Result<void>> {
    return Result.try(async () => {
      const tryHasUser = await this.userRepo.findById(data.userId);
      if (tryHasUser.isFailure) return Result.fail(UserErrors.NOT_FOUND);

      const tryRolesExists = await this.rolesChecker.exists(data.roleIds);
      if (tryRolesExists.isFailure) return Result.fail(tryRolesExists.errors);

      const tryUpdateResult = await this.userRepo.updateRoles(
        data.userId,
        data.roleIds,
      );
      if (tryUpdateResult.isFailure) return Result.fail(tryUpdateResult.errors);
    });
  }
}
