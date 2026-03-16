import { PermissionDTO } from "..";

export class PermissionPolicy {
  private readonly userSet: Set<string>;

  constructor(userPermissionIds: string[]) {
    this.userSet = new Set(userPermissionIds);
  }

  check(requiredPermissions: PermissionDTO[]): boolean {
    const requiredSet = new Set(requiredPermissions.map((p) => p.id!));

    for (const id of requiredSet) {
      if (!this.userSet.has(id)) return false;
    }
    return true;
  }
}
