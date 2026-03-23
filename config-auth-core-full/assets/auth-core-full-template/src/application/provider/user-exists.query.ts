import { Result } from "__SHARED_PACKAGE_NAME__";

export interface UserExistsIn {
    id?: string;
    email?: string;
}

export interface UserExistsQuery {
    execute(input: UserExistsIn): Promise<Result<boolean>>;
}
