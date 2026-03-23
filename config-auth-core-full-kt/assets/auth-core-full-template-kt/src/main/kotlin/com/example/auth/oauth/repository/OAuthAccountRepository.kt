package com.example.auth.oauth.repository

import com.example.auth.oauth.entity.OAuthAccount

interface OAuthAccountRepository {
    suspend fun create(account: OAuthAccount): Result<Unit>
    suspend fun findByUserId(userId: String): List<OAuthAccount>
    suspend fun findByProviderAndAccountId(provider: String, providerAccountId: String): OAuthAccount?
    suspend fun delete(id: String): Result<Unit>
}
