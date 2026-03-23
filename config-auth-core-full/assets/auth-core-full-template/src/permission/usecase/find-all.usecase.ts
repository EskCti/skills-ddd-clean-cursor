import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { FindAllPermissionQuery } from "../provider/permission.query";
import { PermissionDTO } from "../dto";

export class FindAllPermissions implements UseCase<void, PermissionDTO[]> {
  constructor(private readonly findAllQuery: FindAllPermissionQuery) {}

  async execute(): Promise<Result<PermissionDTO[]>> {
    return Result.try(async () => {
      const permissions = await this.findAllQuery.execute();
      permissions.validator.throwsIfFailed();
      return permissions.instance;
    });
  }
}
