import { FindUserByIdQuery } from '../provider';
import { Result, UseCase } from '__SHARED_PACKAGE_NAME__';
import { UserDTO } from '../dto';

export interface FindUserByIdOut extends UserDTO {}

export class FindUserByIdUseCase implements UseCase<string, FindUserByIdOut> {
  constructor(private readonly findById: FindUserByIdQuery) {}

  async execute(id: string): Promise<Result<FindUserByIdOut>> {
    return this.findById.execute(id);
  }
}
