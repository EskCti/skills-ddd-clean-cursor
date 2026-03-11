import { Result } from "__SHARED_PACKAGE_NAME__";
import { UserDTO } from "../dto";

export interface FindUserByIdQuery {
	execute(id: string): Promise<Result<UserDTO>>;
}
