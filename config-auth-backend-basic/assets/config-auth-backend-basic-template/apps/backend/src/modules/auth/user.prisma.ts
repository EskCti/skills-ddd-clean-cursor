import { Injectable } from '@nestjs/common';
import {
  FindUserByEmailQuery,
  FindUserByIdQuery,
  User,
  UserDTO,
  UserErrors,
  UserExistsIn,
  UserExistsQuery,
  UserRepository,
} from '__AUTH_PACKAGE_NAME__';
import { Result } from '@poupig/shared';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class UserPrisma implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  readonly findUserByIdQuery: FindUserByIdQuery = {
    execute: async (id): Promise<Result<UserDTO>> => {
      try {
        const user = await this.prisma.client.user.findFirst({
          where: { id, deletedAt: null },
        });

        if (!user) {
          return Result.fail(UserErrors.NOT_FOUND);
        }

        return Result.ok(this.toDto(user));
      } catch {
        return Result.fail('AUTH_FIND_USER_BY_ID_ERROR');
      }
    },
  };

  readonly findUserByEmailQuery: FindUserByEmailQuery = {
    execute: async (email): Promise<Result<UserDTO>> => {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.prisma.client.user.findFirst({
          where: { email: normalizedEmail, deletedAt: null },
        });

        if (!user) {
          return Result.fail(UserErrors.NOT_FOUND);
        }

        return Result.ok(this.toDto(user));
      } catch {
        return Result.fail('AUTH_FIND_USER_BY_EMAIL_ERROR');
      }
    },
  };

  readonly userExistsQuery: UserExistsQuery = {
    execute: async (input: UserExistsIn): Promise<Result<boolean>> => {
      if (!input.id && !input.email) {
        return Result.fail('USER_EXISTS_INPUT_REQUIRED');
      }

      try {
        const filters = [] as Array<{ id?: string; email?: string }>;

        if (input.id) {
          filters.push({ id: input.id });
        }

        if (input.email) {
          filters.push({ email: input.email.trim().toLowerCase() });
        }

        const count = await this.prisma.client.user.count({
          where: {
            deletedAt: null,
            OR: filters,
          },
        });

        return Result.ok(count > 0);
      } catch(e: unknown) {
        console.error(e);
        return Result.fail('AUTH_USER_EXISTS_QUERY_ERROR');
      }
    },
  };

  async findByEmail(email: string): Promise<Result<User>> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await this.prisma.client.user.findFirst({
        where: { email: normalizedEmail, deletedAt: null },
      });

      if (!user) {
        return Result.fail(UserErrors.NOT_FOUND);
      }

      return this.toDomain(user);
    } catch {
      return Result.fail('AUTH_USER_FIND_BY_EMAIL_ERROR');
    }
  }

  async create(entity: User): Promise<Result<void>> {
    try {
      await this.prisma.client.user.create({
        data: this.fromDomain(entity),
      });
      return Result.ok();
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        return Result.fail(UserErrors.EMAIL_ALREADY_EXISTS);
      }

      return Result.fail('AUTH_USER_CREATE_ERROR');
    }
  }

  async update(entity: User): Promise<Result<void>> {
    try {
      const result = await this.prisma.client.user.updateMany({
        where: { id: entity.id, deletedAt: null },
        data: {
          name: entity.name,
          email: entity.email,
          avatarUrl: entity.avatarUrl ?? null,
          updatedAt: new Date(),
        },
      });

      if (result.count === 0) {
        return Result.fail(UserErrors.NOT_FOUND);
      }

      return Result.ok();
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        return Result.fail(UserErrors.EMAIL_ALREADY_EXISTS);
      }

      return Result.fail('AUTH_USER_UPDATE_ERROR');
    }
  }

  async findById(id: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.client.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!user) {
        return Result.fail(UserErrors.NOT_FOUND);
      }

      return this.toDomain(user);
    } catch {
      return Result.fail('AUTH_USER_FIND_BY_ID_ERROR');
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const result = await this.prisma.client.user.updateMany({
        where: { id, deletedAt: null },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      if (result.count === 0) {
        return Result.fail(UserErrors.NOT_FOUND);
      }

      return Result.ok();
    } catch {
      return Result.fail('AUTH_USER_DELETE_ERROR');
    }
  }

  private toDomain(data: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Result<User> {
    return User.tryCreate({
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    });
  }

  private toDto(data: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): UserDTO {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatarUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    };
  }

  private fromDomain(entity: User) {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      avatarUrl: entity.avatarUrl ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return Boolean(
      error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002',
    );
  }
}
