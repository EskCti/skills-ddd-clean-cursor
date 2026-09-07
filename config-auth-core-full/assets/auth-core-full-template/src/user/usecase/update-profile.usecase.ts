import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { UserErrors } from "../errors";
import { UserRepository } from "../provider";

export interface UpdateProfileIn {
  id: string;
  name: string;
}

export class UpdateProfileUseCase implements UseCase<UpdateProfileIn, void> {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(data: UpdateProfileIn): Promise<Result<void>> {
    return Result.try(async () => {
      const tryHasUser = await this.userRepo.findById(data.id);
      if (tryHasUser.isFailure) return Result.fail(UserErrors.NOT_FOUND);

      const user = tryHasUser.instance;

      const tryUpdatedUser = user.cloneWith({
        name: data.name ?? user.name,
      });
      if (tryUpdatedUser.isFailure) return Result.fail(tryUpdatedUser.errors);

      const tryUpdateResult = await this.userRepo.update(tryUpdatedUser.instance);
      if (tryUpdateResult.isFailure) return Result.fail(tryUpdateResult.errors);
    });
  }
}
