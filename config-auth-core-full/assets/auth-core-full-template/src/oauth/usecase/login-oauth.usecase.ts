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
            if (!input.code) return Result.fail(OAuthErrors.INVALID_CALLBACK_CODE);

            const identityResult = await this.oauthProvider.getIdentityFromCode(
                input.code,
            );
            if (identityResult.isFailure) return Result.fail(identityResult.errors);

            const identity = identityResult.instance;

            if (!identity.email) return Result.fail(OAuthErrors.EMAIL_NOT_AVAILABLE);
            if (!identity.emailVerified) return Result.fail(OAuthErrors.EMAIL_NOT_VERIFIED);

            const linkedAccountResult =
                await this.oauthRepo.findByProviderAccount({
                    provider: identity.provider,
                    providerUserId: identity.providerUserId,
                });

            if (linkedAccountResult.isOk) {
                const existingUser = await this.findUserByIdQuery.execute(
                    linkedAccountResult.instance.userId,
                );
                if (existingUser.isFailure) return Result.fail(existingUser.errors);
                return existingUser.instance;
            }

            const accountNotFound =
                linkedAccountResult.errors?.includes(
                    OAuthErrors.ACCOUNT_NOT_FOUND,
                ) ?? false;
            if (!accountNotFound) {
                return Result.fail(
                    linkedAccountResult.errors ?? OAuthErrors.ACCOUNT_NOT_FOUND,
                );
            }

            const userResult = await this.resolveOrCreateUser(
                identity.email,
                identity.name,
                identity.avatarUrl,
            );
            if (userResult.isFailure) return Result.fail(userResult.errors);

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
            if (linkResult.isFailure) return Result.fail(linkResult.errors);

            const userDto = await this.findUserByIdQuery.execute(user.id);
            if (userDto.isFailure) return Result.fail(userDto.errors);
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
            if (!notFound) {
                return Result.fail(existingUser.errors ?? UserErrors.NOT_FOUND);
            }

            const roleResult = await this.roleRepo.findByName("colaborador");
            if (roleResult.isFailure) return Result.fail(roleResult.errors);

            const userToCreate = User.tryCreate({
                email,
                name: name?.trim() || this.resolveNameFromEmail(email),
                avatarUrl,
                roleIds: [roleResult.instance.id],
            });
            if (userToCreate.isFailure) return Result.fail(userToCreate.errors);

            const createResult = await this.userRepo.create(
                userToCreate.instance,
            );
            if (createResult.isFailure) return Result.fail(createResult.errors);

            const createdUser = await this.userRepo.findByEmail(email);
            if (createdUser.isFailure) return Result.fail(createdUser.errors);
            return createdUser.instance;
        });
    }

    private resolveNameFromEmail(email: string): string {
        const local = email.split("@")[0] ?? "Usuario";
        return local.replace(/[._-]+/g, " ").trim() || "Usuario";
    }
}
