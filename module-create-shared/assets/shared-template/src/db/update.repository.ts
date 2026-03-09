import { Entity, Result } from "../base";

export interface UpdateRepository<T extends Entity<any, any>> {
	update(entity: T): Promise<Result<void>>;
}
