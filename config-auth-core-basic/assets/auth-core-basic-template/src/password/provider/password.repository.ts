import { Result, TransactionContext } from '__SHARED_PACKAGE_NAME__';
import { Password } from '../model/password.entity';

export interface PasswordRepository {
  create(password: Password, userId: string, tx?: TransactionContext): Promise<Result<void>>;
  findActiveByUserId(id: string): Promise<Result<Password>>;
  findRecentByUserId(id: string, limit: number): Promise<Result<Password[]>>;
}
