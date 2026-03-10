import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import {
	Password,
	PasswordProvider,
	PasswordRepository,
	PasswordStatus,
} from "../password";
import { User, UserErrors, UserRepository } from "../user";

export interface CreateUserIn {
	name: string;
	email: string;
	password: string;
}

export class CreateUserUseCase implements UseCase<CreateUserIn, void> {
	constructor(
		private readonly userRepo: UserRepository,
		private readonly passRepo: PasswordRepository,
		private readonly passwordProvider: PasswordProvider,
	) {}

	async execute(data: CreateUserIn): Promise<Result<void>> {
		const hasUser = await this.userRepo.findByEmail(data.email);
		if (hasUser.isOk) {
			return Result.fail(UserErrors.EMAIL_ALREADY_EXISTS);
		}

		if (
			hasUser.isFailure &&
			!hasUser.errors?.includes(UserErrors.NOT_FOUND)
		) {
			return hasUser.withFail;
		}

		const hashedPassword = await this.passwordProvider.hash(data.password);
		const passResult = Password.tryCreate({
			content: hashedPassword,
			status: PasswordStatus.ACTIVE,
		});
		if (passResult.isFailure) {
			return passResult.withFail;
		}

		const userResult = User.tryCreate({
			name: data.name,
			email: data.email,
		});
		if (userResult.isFailure) {
			return userResult.withFail;
		}

		const userCreatedResult = await this.userRepo.create(userResult.instance);
		if (userCreatedResult.isFailure) {
			return userCreatedResult.withFail;
		}

		const createdUser = await this.userRepo.findByEmail(data.email);
		if (createdUser.isFailure) {
			return createdUser.withFail;
		}

		const passSaveResult = await this.passRepo.create(
			passResult.instance,
			createdUser.instance.id,
		);
		if (passSaveResult.isFailure) {
			return passSaveResult.withFail;
		}

		return Result.ok();
	}
}
