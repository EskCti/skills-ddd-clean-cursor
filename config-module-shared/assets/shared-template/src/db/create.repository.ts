import { Entity, Result } from "../base";

export interface CreateRepository<T extends Entity<any, any>> {
	create(entity: T): Promise<Result<void>>;
}
