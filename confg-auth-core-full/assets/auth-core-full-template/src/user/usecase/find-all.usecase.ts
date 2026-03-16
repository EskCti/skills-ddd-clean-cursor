import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { FindAllUsersInDTO, FindAllUsersOutDTO } from "../dto";
import { FindAllUsersQuery } from "../provider";

export class FindAllUsersUseCase
  implements UseCase<FindAllUsersInDTO, FindAllUsersOutDTO>
{
  constructor(private readonly findAll: FindAllUsersQuery) {}

  async execute(input: FindAllUsersInDTO): Promise<Result<FindAllUsersOutDTO>> {
    return Result.try(async () => {
      const usersResult = await this.findAll.execute(input);
      if (usersResult.isFailure) {
        return {
          data: [],
          meta: {
            page: input.page,
            pageSize: input.pageSize,
            total: 0,
            totalPages: 0,
          },
        };
      }

      return usersResult.instance;
    });
  }
}
