import { Result, UseCase } from "__SHARED_PACKAGE_NAME__";
import { FindAllRolesInDTO, FindAllRolesOutDTO } from "../dto";
import { FindAllRolesQuery } from "../provider";

export class FindAllRoles
  implements UseCase<FindAllRolesInDTO, FindAllRolesOutDTO>
{
  constructor(private readonly findAllRoles: FindAllRolesQuery) {}

  async execute(input: FindAllRolesInDTO): Promise<Result<FindAllRolesOutDTO>> {
    return Result.try(async () => {
      const rolesList = await this.findAllRoles.execute(input);
      if (rolesList.isFailure) {
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

      return rolesList.instance;
    });
  }
}
