import { Entity } from "../base";
import { CreateRepository } from "./create.repository";
import { UpdateRepository } from "./update.repository";
import { FindByIdRepository } from "./find-by-id.repository";
import { DeleteRepository } from "./delete.repository";

export interface CrudRepository<T extends Entity<any, any>>
  extends
    CreateRepository<T>,
    UpdateRepository<T>,
    FindByIdRepository<T>,
    DeleteRepository<T> {}
