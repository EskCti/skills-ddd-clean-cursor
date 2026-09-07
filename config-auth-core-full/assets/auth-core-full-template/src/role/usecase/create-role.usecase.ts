import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { Role } from "../model/role.entity";
import { RoleErrors } from "../errors";
import { PermissionsExistQuery, RoleRepository } from "../provider";

export interface CreateRoleIn {
    name: string;
    description: string;
    permissionIds: string[];
}

export class CreateRole implements UseCase<CreateRoleIn, void> {
    constructor(
        private readonly repo: RoleRepository,
        private readonly permissionChecker: PermissionsExistQuery,
    ) {}

    async execute({
        name,
        description,
        permissionIds,
    }: CreateRoleIn): Promise<Result<void>> {
        return Result.try(async () => {
            const result = await this.repo.findByName(name);
            if (result.isOk) return Result.fail(RoleErrors.NAME_ALREADY_EXISTS);

            if (permissionIds.length > 0) {
                const exists =
                    await this.permissionChecker.execute(permissionIds);
                if (exists.isFailure) return Result.fail(exists.errors);
            }
            const roleResult = Role.tryCreate({
                name,
                description,
                permissionIds: permissionIds,
            });
            if (roleResult.isFailure) return Result.fail(roleResult.errors);
            const role = roleResult.instance;

            const createResult = await this.repo.create(role);
            if (createResult.isFailure) return Result.fail(createResult.errors);
        });
    }
}
