package com.example.auth.domain.entity

import com.example.shared.domain.result.DomainResult
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
        ): DomainResult<OAuthAccount> {
            val idResult = Id.tryCreate(id)
            val userIdResult = Id.required(userId)

            val errors = listOf(idResult, userIdResult).flatMap { it.errors }.toMutableList()
            if (provider.isBlank()) errors.add("PROVIDER_REQUIRED")
            if (providerAccountId.isBlank()) errors.add("PROVIDER_ACCOUNT_ID_REQUIRED")

            if (errors.isNotEmpty()) {
                return DomainResult.failure(errors)
            }

            return DomainResult.success(
                OAuthAccount(
                    id = idResult.value!!,
                    userId = userIdResult.value!!,
                    provider = provider,
                    providerAccountId = providerAccountId
                )
            )
        }
    }
}