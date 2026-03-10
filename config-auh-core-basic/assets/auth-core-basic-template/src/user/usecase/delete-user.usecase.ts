import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { UserRepository } from "../provider";

export interface DeleteUserIn {
	id: string;
}

export class DeleteUserUseCase implements UseCase<DeleteUserIn, void> {
	constructor(private readonly userRepo: UserRepository) {}

	async execute({ id }: DeleteUserIn): Promise<Result<void>> {
		const result = await this.userRepo.delete(id);
		if (result.isFailure) {
			return result.withFail;
		}
		return Result.ok();
	}
}
