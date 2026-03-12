import { Entity, Result } from '../base';
import { TransactionContext } from './transaction.manager';

export interface CreateRepository<T extends Entity<any, any>> {
  create(entity: T, tx?: TransactionContext): Promise<Result<void>>;
}
