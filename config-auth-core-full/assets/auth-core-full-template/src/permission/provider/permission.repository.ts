import { CrudRepository } from "__SHARED_PACKAGE_NAME__";
import { Permission } from "../model/permission.entity";

export interface PermissionRepository extends CrudRepository<Permission> {}
