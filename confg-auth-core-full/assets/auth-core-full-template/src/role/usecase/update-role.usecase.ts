import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { RoleProps } from "../model/role.entity";
import { PermissionsExistQuery, RoleRepository } from "../provider";

export interface UpdateRoleIn {
    id: string;
    name?: string;
    description?: string;
    permissionIds?: string[];
}

export class UpdateRoleUseCase implements UseCase<UpdateRoleIn, void> {
    constructor(
        private readonly repo: RoleRepository,
        private readonly permissionChecker: PermissionsExistQuery,
    ) {}

    async execute({
        id,
        name,
        description,
        permissionIds,
    }: UpdateRoleIn): Promise<Result<void>> {
        return Result.try(async () => {
            const result = await this.repo.findById(id);
            result.validator.throwsIfFailed();

            const role = result.instance;
            const updates: Partial<RoleProps> = {};

            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (permissionIds !== undefined) {
                const exists = await this.permissionChecker.execute(
                    permissionIds ?? [],
                );
                if (exists.isOk) {
                    updates.permissionIds = permissionIds;
                }
            }

            const updatedRoleResult = role.cloneWith(updates);
            updatedRoleResult.validator.throwsIfFailed();

            const updateResult = await this.repo.update(
                updatedRoleResult.instance,
            );
            updateResult.validator.throwsIfFailed();
        });
    }
}
