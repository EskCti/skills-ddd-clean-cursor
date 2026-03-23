import { Result } from "__SHARED_PACKAGE_NAME__";
import { FindAllUsersInDTO, FindAllUsersOutDTO } from "../dto";

export interface FindAllUsersQuery {
  execute(input: FindAllUsersInDTO): Promise<Result<FindAllUsersOutDTO>>;
}
