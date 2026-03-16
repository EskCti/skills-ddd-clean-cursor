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

            Result.ok(result.isOk).validator.throwsIfTrue(
                RoleErrors.NAME_ALREADY_EXISTS,
            );

            if (permissionIds.length > 0) {
                const exists =
                    await this.permissionChecker.execute(permissionIds);
                exists.validator.throwsIfFailed();
            }
            const role = Role.create({
                name,
                description,
                permissionIds: permissionIds,
            });

            const createResult = await this.repo.create(role);
            createResult.validator.throwsIfFailed();
        });
    }
}
