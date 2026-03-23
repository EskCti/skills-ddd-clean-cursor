import { Result } from "__SHARED_PACKAGE_NAME__";
import { FindAllRolesInDTO, FindAllRolesOutDTO } from "../dto";

export interface FindAllRolesQuery {
  execute(input: FindAllRolesInDTO): Promise<Result<FindAllRolesOutDTO>>;
}
