import { Result } from "__SHARED_PACKAGE_NAME__";
import { OAuthIdentityDTO } from "../dto";

export interface OAuthProvider {
    getAuthorizationUrl(state: string): Result<string>;
    getIdentityFromCode(code: string): Promise<Result<OAuthIdentityDTO>>;
}
