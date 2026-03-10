import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { UserExistsQuery } from "../provider";
import {
	Password,
	PasswordCryptoProvider,
	PasswordRepository,
} from "../../password";
import { User, UserErrors, UserRepository } from "../../user";

export interface CreateUserIn {
	name: string;
	email: string;
	password: string;
}

export class CreateUserUseCase implements UseCase<CreateUserIn, void> {
	constructor(
		private readonly userRepo: UserRepository,
		private readonly passRepo: PasswordRepository,
		private readonly userExistsQuery: UserExistsQuery,
		private readonly passwordCryptoProvider: PasswordCryptoProvider,
	) {}

	async execute(data: CreateUserIn): Promise<Result<void>> {
		const userExistsResult = await this.userExistsQuery.execute({
			email: data.email,
		});
		if (userExistsResult.isFailure) {
			return userExistsResult.withFail;
		}

		if (userExistsResult.instance) {
			return Result.fail(UserErrors.EMAIL_ALREADY_EXISTS);
		}

		const hashedPassword = await this.passwordCryptoProvider.hash(data.password);
		
		const passResult = Password.tryCreate({ content: hashedPassword });
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
