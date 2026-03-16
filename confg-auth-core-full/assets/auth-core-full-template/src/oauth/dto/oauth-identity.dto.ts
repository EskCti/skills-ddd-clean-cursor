import { OAuthIdentityProvider } from "../model/oauth-provider.enum";

export interface OAuthIdentityDTO {
    provider: OAuthIdentityProvider;
    providerUserId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    avatarUrl?: string;
}
