import { Entity, Result } from "../base";

export interface DeleteRepository<T extends Entity<any, any>> {
	delete(id: string): Promise<Result<void>>;
}
