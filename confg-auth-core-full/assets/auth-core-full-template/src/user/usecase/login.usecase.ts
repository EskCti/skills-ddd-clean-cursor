import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { PasswordCryptoProvider, PasswordErrors } from "../../password";
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
        private readonly passwordCryptoProvider: PasswordCryptoProvider,
    ) {}

    async execute(input: LoginIn): Promise<Result<LoginOut>> {
        return Result.try(async () => {
            const tryFindUser = await this.repo.findByEmail(input.email);
            tryFindUser.validator.throwsIfFailed();

            const tryFindPass = await this.findPassHash.execute(
                tryFindUser.instance.id,
            );
            tryFindPass.validator.throwsIfFailed();

            const isSamePass = await this.passwordCryptoProvider.compare(
                input.password,
                tryFindPass.instance.hash,
            );
            Result.ok(isSamePass).validator.throwsIfFalse(PasswordErrors.MISMATCH);

            return tryFindUser.instance.props;
        });
    }
}
