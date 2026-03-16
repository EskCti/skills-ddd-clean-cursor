import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { RoleRepository } from "../../role";
import {
    FindUserByIdQuery,
    User,
    UserDTO,
    UserErrors,
    UserRepository,
} from "../../user";
import { OAuthErrors } from "../errors";
import { OAuthProvider, OAuthAccountRepository } from "../provider";

export interface LoginOAuthInDTO {
    code: string;
}

export interface LoginOAuthOutDTO extends UserDTO {}

export class LoginOAuthUseCase implements UseCase<
    LoginOAuthInDTO,
    LoginOAuthOutDTO
> {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly findUserByIdQuery: FindUserByIdQuery,
        private readonly roleRepo: RoleRepository,
        private readonly oauthRepo: OAuthAccountRepository,
        private readonly oauthProvider: OAuthProvider,
    ) {}

    async execute(input: LoginOAuthInDTO): Promise<Result<LoginOAuthOutDTO>> {
        return Result.try(async () => {
            Result.ok(Boolean(input.code)).validator.throwsIfFalse(
                OAuthErrors.INVALID_CALLBACK_CODE,
            );

            const identityResult = await this.oauthProvider.getIdentityFromCode(
                input.code,
            );
            identityResult.validator.throwsIfFailed();

            const identity = identityResult.instance;

            Result.ok(Boolean(identity.email)).validator.throwsIfFalse(
                OAuthErrors.EMAIL_NOT_AVAILABLE,
            );
            Result.ok(identity.emailVerified).validator.throwsIfFalse(
                OAuthErrors.EMAIL_NOT_VERIFIED,
            );

            const linkedAccountResult =
                await this.oauthRepo.findByProviderAccount({
                    provider: identity.provider,
                    providerUserId: identity.providerUserId,
                });

            if (linkedAccountResult.isOk) {
                const existingUser = await this.findUserByIdQuery.execute(
                    linkedAccountResult.instance.userId,
                );
                existingUser.validator.throwsIfFailed();
                return existingUser.instance;
            }

            const accountNotFound =
                linkedAccountResult.errors?.includes(
                    OAuthErrors.ACCOUNT_NOT_FOUND,
                ) ?? false;
            Result.ok(accountNotFound).validator.throwsIfFalse(
                linkedAccountResult.errors ?? OAuthErrors.ACCOUNT_NOT_FOUND,
            );

            const userResult = await this.resolveOrCreateUser(
                identity.email,
                identity.name,
                identity.avatarUrl,
            );
            userResult.validator.throwsIfFailed();

            const user = userResult.instance;
            const linkResult = await this.oauthRepo.create({
                userId: user.id,
                provider: identity.provider,
                providerUserId: identity.providerUserId,
                email: identity.email,
                emailVerified: identity.emailVerified,
                name: identity.name,
                avatarUrl: identity.avatarUrl,
            });
            linkResult.validator.throwsIfFailed();

            const userDto = await this.findUserByIdQuery.execute(user.id);
            userDto.validator.throwsIfFailed();
            return userDto.instance;
        });
    }

    private async resolveOrCreateUser(
        email: string,
        name?: string,
        avatarUrl?: string,
    ): Promise<Result<User>> {
        return Result.try(async () => {
            const existingUser = await this.userRepo.findByEmail(email);
            if (existingUser.isOk) {
                return existingUser.instance;
            }

            const notFound =
                existingUser.errors?.includes(UserErrors.NOT_FOUND) ?? false;
            Result.ok(notFound).validator.throwsIfFalse(
                existingUser.errors ?? UserErrors.NOT_FOUND,
            );

            const roleResult = await this.roleRepo.findByName("colaborador");
            roleResult.validator.throwsIfFailed();

            const userToCreate = User.tryCreate({
                email,
                name: name?.trim() || this.resolveNameFromEmail(email),
                avatarUrl,
                roleIds: [roleResult.instance.id],
            });
            userToCreate.validator.throwsIfFailed();

            const createResult = await this.userRepo.create(
                userToCreate.instance,
            );
            createResult.validator.throwsIfFailed();

            const createdUser = await this.userRepo.findByEmail(email);
            createdUser.validator.throwsIfFailed();
            return createdUser.instance;
        });
    }

    private resolveNameFromEmail(email: string): string {
        const local = email.split("@")[0] ?? "Usuario";
        return local.replace(/[._-]+/g, " ").trim() || "Usuario";
    }
}
