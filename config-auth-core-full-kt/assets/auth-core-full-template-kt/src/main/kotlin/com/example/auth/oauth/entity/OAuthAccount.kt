package com.example.auth.oauth.entity

import com.example.shared.domain.vo.Id

data class OAuthAccount private constructor(
    val id: Id,
    val userId: Id,
    val provider: String,
    val providerAccountId: String
) {
    companion object {
        fun create(
            id: String? = null,
            userId: String,
            provider: String,
            providerAccountId: String
        ): OAuthAccount = tryCreate(id, userId, provider, providerAccountId).getOrThrow()

        fun tryCreate(
            id: String? = null,
            userId: String,
            provider: String,
            providerAccountId: String
        ): Result<OAuthAccount> {
            val validId = Id.tryCreate(id).getOrElse { return Result.failure(it) }
            val validUserId = Id.required(userId).getOrElse { return Result.failure(it) }
            if (provider.isBlank()) return Result.failure(IllegalArgumentException("PROVIDER_REQUIRED"))
            if (providerAccountId.isBlank()) return Result.failure(IllegalArgumentException("PROVIDER_ACCOUNT_ID_REQUIRED"))
            return Result.success(OAuthAccount(validId, validUserId, provider, providerAccountId))
        }
    }
}
