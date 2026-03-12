import { SetMetadata } from '@nestjs/common';

export const ADMIN_ACCESS_METADATA_KEY = 'auth:admin-access';

export interface RequireAdminOptions {
  allowSelfByParam?: string;
}

export const RequireAdmin = (options: RequireAdminOptions = {}) =>
  SetMetadata(ADMIN_ACCESS_METADATA_KEY, options);
