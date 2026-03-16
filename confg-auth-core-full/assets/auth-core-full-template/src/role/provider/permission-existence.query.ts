import { Result } from "__SHARED_PACKAGE_NAME__";

export interface PermissionsExistQuery {
  execute(ids: string[]): Promise<Result<boolean>>;
}
