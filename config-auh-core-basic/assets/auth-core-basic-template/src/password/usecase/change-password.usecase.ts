import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { UserExistsQuery } from "../../application";
import {
	Password,
	PasswordChangePolicyService,
} from "../model";
import { PasswordRepository, PasswordCryptoProvider } from "../provider";
import { PasswordErrors } from "../errors";

export interface ChangePasswordIn {
	userId: string;
	oldPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export class ChangePasswordUseCase implements UseCase<ChangePasswordIn, void> {
	constructor(
		private readonly passRepo: PasswordRepository,
		private readonly userExistsQuery: UserExistsQuery,
		private readonly passwordCryptoProvider: PasswordCryptoProvider,
	) {}

	async execute(input: ChangePasswordIn): Promise<Result<void>> {
		const userExistsResult = await this.userExistsQuery.execute({
			id: input.userId,
		});
		if (userExistsResult.isFailure) {
			return userExistsResult.withFail;
		}

		if (!userExistsResult.instance) {
			return Result.fail(PasswordErrors.INVALID_USER);
		}

		const recentPasswordsResult = await this.passRepo.findRecentByUserId(
			input.userId,
			5,
		);

		if (recentPasswordsResult.isFailure) {
			return recentPasswordsResult.withFail;
		}

		const passwordPolicyResult = await PasswordChangePolicyService.validate({
			newPassword: input.newPassword,
			confirmPassword: input.confirmPassword,
			recentPasswords: recentPasswordsResult.instance,
			passwordCryptoProvider: this.passwordCryptoProvider,
		});

		if (passwordPolicyResult.isFailure) {
			return passwordPolicyResult.withFail;
		}

		const hashedPassword = await this.passwordCryptoProvider.hash(input.newPassword);
		
		const newPassResult = Password.tryCreate({ content: hashedPassword });

		if (newPassResult.isFailure) {
			return newPassResult.withFail;
		}

		const createResult = await this.passRepo.create(
			newPassResult.instance,
			input.userId,
		);

		return createResult
	}
}
