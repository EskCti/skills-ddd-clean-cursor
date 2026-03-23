import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserDTO } from '__AUTH_PACKAGE_NAME__';
import {
  ADMIN_ACCESS_METADATA_KEY,
  type RequireAdminOptions,
} from './require-admin.decorator';

@Injectable()
export class RequireAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<
      RequireAdminOptions | undefined
    >(ADMIN_ACCESS_METADATA_KEY, [context.getHandler(), context.getClass()]);

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: UserDTO;
      params?: Record<string, string | undefined>;
    }>();

    const user = request.user;
    if (!user) {
      return false;
    }

    if (user.admin) {
      return true;
    }

    if (options.allowSelfByParam) {
      const value = request.params?.[options.allowSelfByParam];
      if (value && value === user.id) {
        return true;
      }
    }

    throw new ForbiddenException({ errors: ['AUTH_ADMIN_REQUIRED'] });
  }
}
