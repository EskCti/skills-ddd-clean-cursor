import { CrudRepository, Result } from "__SHARED_PACKAGE_NAME__";
import { User } from "../model/user.entity";

export interface UserRepository extends CrudRepository<User> {
	findByEmail(email: string): Promise<Result<User>>;
}
