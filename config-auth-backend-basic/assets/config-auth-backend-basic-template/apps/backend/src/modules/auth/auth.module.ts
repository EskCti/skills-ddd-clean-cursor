import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { SignOptions } from 'jsonwebtoken';
import { DbModule } from '../../db/db.module';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { PasswordPrisma } from './password.prisma';
import { BcryptProvider } from './providers/bcrypt.provider';
import { RequireAdminGuard } from './require-admin.guard';
import { UserPrisma } from './user.prisma';

@Module({
  imports: [
    DbModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? 'YOUR_SECRET_HERE',
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN ??
            '15d') as SignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserPrisma,
    PasswordPrisma,
    JwtStrategy,
    JwtAuthGuard,
    RequireAdminGuard,
    BcryptProvider,
  ],
  exports: [
    UserPrisma,
    PasswordPrisma,
    BcryptProvider,
    JwtAuthGuard,
    RequireAdminGuard,
  ],
})
export class AuthModule {}
