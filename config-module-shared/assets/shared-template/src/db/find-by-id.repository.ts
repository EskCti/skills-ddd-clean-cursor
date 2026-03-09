import { Entity, Result } from "../base";

export interface FindByIdRepository<T extends Entity<any, any>> {
	findById(id: string): Promise<Result<T>>;
}
