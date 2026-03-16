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
      tryHasUser.validator.throwsIfFailed(UserErrors.NOT_FOUND);

      const tryRolesExists = await this.rolesChecker.exists(data.roleIds);
      tryRolesExists.validator.throwsIfFailed();

      const tryUpdateResult = await this.userRepo.updateRoles(
        data.userId,
        data.roleIds,
      );
      tryUpdateResult.validator.throwsIfFailed();
    });
  }
}
