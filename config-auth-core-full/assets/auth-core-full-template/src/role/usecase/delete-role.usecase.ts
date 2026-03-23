import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { RoleRepository } from "../provider";

export interface DeleteRoleIn {
  id: string;
}

export class DeleteRoleUseCase implements UseCase<DeleteRoleIn, void> {
  constructor(private readonly roleRepo: RoleRepository) {}

  async execute({ id }: DeleteRoleIn): Promise<Result<void>> {
    return this.roleRepo.delete(id);
  }
}
