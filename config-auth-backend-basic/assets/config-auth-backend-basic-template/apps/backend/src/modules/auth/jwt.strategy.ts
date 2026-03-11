import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { UserDTO } from '__AUTH_PACKAGE_NAME__';
import { UserPrisma } from './user.prisma';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userPrisma: UserPrisma) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'YOUR_SECRET_HERE',
    });
  }

  async validate(payload: JwtPayload): Promise<UserDTO> {
    const userResult = await this.userPrisma.findUserByIdQuery.execute(payload.sub);

    if (userResult.isFailure) {
      throw new UnauthorizedException();
    }

    return userResult.instance;
  }
}
