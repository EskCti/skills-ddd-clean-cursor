import { CreateRepository } from './create.repository';
import { DeleteRepository } from './delete.repository';
import { Entity } from '../base';
import { FindByIdRepository } from './find-by-id.repository';
import { UpdateRepository } from './update.repository';

export interface CrudRepository<T extends Entity<any, any>>
  extends CreateRepository<T>, UpdateRepository<T>, FindByIdRepository<T>, DeleteRepository {}
