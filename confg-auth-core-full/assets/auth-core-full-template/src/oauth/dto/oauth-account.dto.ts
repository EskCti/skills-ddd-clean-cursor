import { OAuthIdentityProvider } from "../model/oauth-provider.enum";

export interface OAuthAccountDTO {
    userId: string;
    provider: OAuthIdentityProvider;
    providerUserId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    avatarUrl?: string;
}

export interface FindOAuthAccountInDTO {
    provider: OAuthIdentityProvider;
    providerUserId: string;
}

export interface CreateOAuthAccountInDTO extends OAuthAccountDTO {}
