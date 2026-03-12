export interface TransactionContext {}

export interface TransactionManager<CTX extends TransactionContext = TransactionContext> {
  runInTransaction<T>(operation: (context: CTX) => Promise<T>): Promise<T>;
}
