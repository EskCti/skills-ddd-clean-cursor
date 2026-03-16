import { Result } from "__SHARED_PACKAGE_NAME__";
import { PermissionDTO } from "../dto";

export interface FindAllPermissionQuery {
  execute(): Promise<Result<PermissionDTO[]>>;
}
