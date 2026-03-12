import { Injectable } from '@nestjs/common';
import {
  FindPasswordHashQuery,
  Password,
  PasswordErrors,
  PasswordRepository,
  UserErrors,
} from '__AUTH_PACKAGE_NAME__';
import { Result, type TransactionContext } from '__SHARED_PACKAGE_NAME__';
import {
  PrismaService,
  type PrismaTransactionContext,
} from '../../db/prisma.service';

@Injectable()
export class PasswordPrisma implements PasswordRepository {
  constructor(private readonly prisma: PrismaService) {}

  readonly findPasswordHashQuery: FindPasswordHashQuery = {
    execute: async (userId): Promise<Result<{ hash: string }>> => {
      try {
        const password = await this.prisma.client.password.findFirst({
          where: {
            userId,
            deletedAt: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!password) {
          return Result.fail(UserErrors.NOT_FOUND);
        }

        return Result.ok({ hash: password.hash });
      } catch {
        return Result.fail('AUTH_FIND_PASSWORD_HASH_ERROR');
      }
    },
  };

  async create(
    entity: Password,
    userId: string,
    tx?: TransactionContext,
  ): Promise<Result<void>> {
    try {
      await this.resolveClient(tx).password.create({
        data: {
          id: entity.id,
          userId,
          hash: entity.content,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
          deletedAt: entity.deletedAt,
        },
      });

      return Result.ok();
    } catch {
      return Result.fail('AUTH_PASSWORD_CREATE_ERROR');
    }
  }

  async findActiveByUserId(id: string): Promise<Result<Password>> {
    try {
      const password = await this.prisma.client.password.findFirst({
        where: {
          userId: id,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!password) {
        return Result.fail(PasswordErrors.MISMATCH);
      }

      return this.toDomain(password);
    } catch {
      return Result.fail('AUTH_PASSWORD_FIND_ACTIVE_ERROR');
    }
  }

  async findRecentByUserId(
    id: string,
    limit: number,
  ): Promise<Result<Password[]>> {
    try {
      const passwords = await this.prisma.client.password.findMany({
        where: {
          userId: id,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      const parsed = passwords.map((password) =>
        Password.tryCreate({
          id: password.id,
          content: password.hash,
          createdAt: password.createdAt,
          updatedAt: password.updatedAt,
          deletedAt: password.deletedAt,
        }),
      );

      const combined = Result.combine(parsed);
      if (combined.isFailure) {
        return combined.withFail;
      }

      return Result.ok(combined.instance);
    } catch {
      return Result.fail('AUTH_PASSWORD_FIND_RECENT_ERROR');
    }
  }

  private toDomain(data: {
    id: string;
    hash: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Result<Password> {
    return Password.tryCreate({
      id: data.id,
      content: data.hash,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    });
  }

  private resolveClient(tx?: TransactionContext) {
    return (
      (tx as PrismaTransactionContext | undefined)?.client ?? this.prisma.client
    );
  }
}
