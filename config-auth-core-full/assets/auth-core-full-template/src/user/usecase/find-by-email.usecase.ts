import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { UserDTO } from "../dto";
import { FindUserByEmailQuery } from "../provider";

export interface FindUserByEmailOut extends UserDTO {}

export class FindUserByEmailUseCase
    implements UseCase<string, FindUserByEmailOut>
{
    constructor(private readonly findByEmail: FindUserByEmailQuery) {}

    async execute(email: string): Promise<Result<FindUserByEmailOut>> {
        return this.findByEmail.execute(email);
    }
}
