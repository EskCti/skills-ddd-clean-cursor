package com.example.auth.oauth.provider

data class OAuthUserInfo(
    val providerAccountId: String,
    val email: String,
    val name: String?
)

interface OAuthTokenProvider {
    suspend fun validateToken(provider: String, token: String): Result<OAuthUserInfo>
}
