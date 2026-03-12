import { Result } from '../base';
import { TransactionContext } from './transaction.manager';

export interface DeleteRepository {
  delete(id: string, tx?: TransactionContext): Promise<Result<void>>;
}
