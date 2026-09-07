package com.example.auth.application.usecase

import com.example.auth.application.query.FindUserByIdQuery
import com.example.auth.domain.entity.OAuthAccount
import com.example.auth.domain.provider.OAuthTokenProvider
import com.example.auth.domain.repository.OAuthAccountRepository
import com.example.shared.domain.result.DomainResult

class LinkOAuthAccountUseCase(
    private val oauthRepository: OAuthAccountRepository,
    private val tokenProvider: OAuthTokenProvider,
    private val findUserById: FindUserByIdQuery
) {
    suspend fun execute(userId: String, provider: String, token: String): DomainResult<OAuthAccount> {
        findUserById.findById(userId)
            ?: return DomainResult.failure(listOf("USER_NOT_FOUND"))

        val tokenResult = tokenProvider.validateToken(provider, token)
        if (tokenResult.isFailure) {
            return DomainResult.failure(tokenResult.errors)
        }
        val userInfo = tokenResult.value!!

        val existing = oauthRepository.findByProviderAndAccountId(provider, userInfo.providerAccountId)
        if (existing != null) {
            return DomainResult.failure(listOf("OAUTH_ACCOUNT_ALREADY_LINKED"))
        }

        val account = OAuthAccount.create(
            userId = userId,
            provider = provider,
            providerAccountId = userInfo.providerAccountId
        )
        val createResult = oauthRepository.create(account)
        if (createResult.isFailure) {
            return DomainResult.failure(createResult.errors)
        }
        return DomainResult.success(account)
    }
}