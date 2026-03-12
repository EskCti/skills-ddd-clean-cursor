import { Entity, Result } from '../base';
import { TransactionContext } from './transaction.manager';

export interface UpdateRepository<T extends Entity<any, any>> {
  update(entity: T, tx?: TransactionContext): Promise<Result<void>>;
}
