import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { PasswordErrors, PasswordProvider } from "../../password";
import { UserProps } from "../model";
import { FindPasswordHashQuery, UserRepository } from "../provider";

export interface LoginIn {
	email: string;
	password: string;
}

export interface LoginOut extends UserProps {}

export class LoginUseCase implements UseCase<LoginIn, LoginOut> {
	constructor(
		private readonly repo: UserRepository,
		private readonly findPassHash: FindPasswordHashQuery,
		private readonly passwordProvider: PasswordProvider,
	) {}

	async execute(input: LoginIn): Promise<Result<LoginOut>> {
		const userResult = await this.repo.findByEmail(input.email);
		if (userResult.isFailure) return userResult.withFail;

		const passResult = await this.findPassHash.execute(userResult.instance.id);
		if (passResult.isFailure) return passResult.withFail;

		const isSamePass = await this.passwordProvider.compare(
			input.password,
			passResult.instance.hash,
		);

		if (!isSamePass) return Result.fail(PasswordErrors.MISMATCH);

		return Result.ok(userResult.instance.props);
	}
}
