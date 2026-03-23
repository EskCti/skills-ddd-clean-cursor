import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UserDTO } from '__AUTH_PACKAGE_NAME__';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserDTO => {
    const request = ctx.switchToHttp().getRequest<{ user: UserDTO }>();
    return request.user;
  },
);
