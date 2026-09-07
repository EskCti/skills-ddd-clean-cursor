package com.example.auth.domain.repository

import com.example.auth.domain.entity.OAuthAccount
import com.example.shared.domain.result.DomainResult

interface OAuthAccountRepository {
    suspend fun create(account: OAuthAccount): DomainResult<Unit>
    suspend fun findByUserId(userId: String): List<OAuthAccount>
    suspend fun findByProviderAndAccountId(provider: String, providerAccountId: String): OAuthAccount?
    suspend fun delete(id: String): DomainResult<Unit>
}