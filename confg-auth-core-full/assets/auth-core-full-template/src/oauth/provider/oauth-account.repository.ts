import { Result } from "__SHARED_PACKAGE_NAME__";
import { CreateOAuthAccountInDTO, FindOAuthAccountInDTO, OAuthAccountDTO } from "../dto";

export interface OAuthAccountRepository {
  findByProviderAccount(data: FindOAuthAccountInDTO): Promise<Result<OAuthAccountDTO>>;
  create(data: CreateOAuthAccountInDTO): Promise<Result<void>>;
}
