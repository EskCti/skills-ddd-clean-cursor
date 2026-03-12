import { Result } from '__SHARED_PACKAGE_NAME__';

export interface FindPasswordHashQuery {
  execute(userId: string): Promise<Result<{ hash: string }>>;
}
