import { UserProps } from "../model";

export interface UserDTO extends Omit<UserProps, "roleIds"> {
  roles: { id: string; name: string }[];
  permissions: {
    id: string;
    name: string;
    alias: string;
    criticality: string;
  }[];
}
