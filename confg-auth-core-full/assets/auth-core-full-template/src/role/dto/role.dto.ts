import { RoleProps } from "../model/role.entity";

export interface RoleDTO extends Omit<RoleProps, "permissionIds"> {
  permissions: { id: string; name: string; alias: string }[];
}
