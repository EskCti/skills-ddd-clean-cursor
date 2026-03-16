import { Result } from "__SHARED_PACKAGE_NAME__";

export interface RolesExistence {
  exists(ids: string[]): Promise<Result<boolean>>;
}
