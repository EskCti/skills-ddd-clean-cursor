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
            if (result.isFailure) return Result.fail(result.errors);

            const role = result.instance;
            const updates: Partial<RoleProps> = {};

            if (name !== undefined) updates.name = name;
            if (description !== undefined) updates.description = description;
            if (permissionIds !== undefined) {
                const exists = await this.permissionChecker.execute(
                    permissionIds ?? [],
                );
                if (exists.isFailure) return Result.fail(exists.errors);
                updates.permissionIds = permissionIds;
            }

            const updatedRoleResult = role.cloneWith(updates);
            if (updatedRoleResult.isFailure) return Result.fail(updatedRoleResult.errors);

            const updateResult = await this.repo.update(
                updatedRoleResult.instance,
            );
            if (updateResult.isFailure) return Result.fail(updateResult.errors);
        });
    }
}
