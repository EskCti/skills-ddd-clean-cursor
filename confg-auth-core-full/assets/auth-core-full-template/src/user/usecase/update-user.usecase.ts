import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { UserErrors } from "../errors";
import { UserRepository } from "../provider";

export interface UpdateUserIn {
  id: string;
  name?: string;
  email?: string;
}

export class UpdateUserUseCase implements UseCase<UpdateUserIn, void> {
  constructor(
    private readonly userRepo: UserRepository,
  ) {}

  async execute(data: UpdateUserIn): Promise<Result<void>> {
    return Result.try(async () => {
      const tryHasUser = await this.userRepo.findById(data.id);
      tryHasUser.validator.throwsIfFailed(UserErrors.NOT_FOUND);

      const user = tryHasUser.instance;

      const tryUpdatedUser = user.cloneWith({
        ...user.props,
        name: data.name ?? user.name,
        email: data.email ?? user.email,
      });
      tryUpdatedUser.validator.throwsIfFailed();

      const tryUpdateResult = await this.userRepo.update(tryUpdatedUser.instance);
      tryUpdateResult.validator.throwsIfFailed();
    });
  }
}
