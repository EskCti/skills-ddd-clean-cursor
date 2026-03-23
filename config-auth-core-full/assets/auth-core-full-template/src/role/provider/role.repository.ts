import { CrudRepository, Result } from "__SHARED_PACKAGE_NAME__";
import { Role } from "../model/role.entity";

export interface RoleRepository extends CrudRepository<Role> {
    findByName(name: string): Promise<Result<Role>>;
}
