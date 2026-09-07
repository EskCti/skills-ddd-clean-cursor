package com.example.auth.domain.provider

import com.example.shared.domain.result.DomainResult

data class OAuthUserInfo(
    val providerAccountId: String,
    val email: String,
    val name: String?
)

interface OAuthTokenProvider {
    suspend fun validateToken(provider: String, token: String): DomainResult<OAuthUserInfo>
}