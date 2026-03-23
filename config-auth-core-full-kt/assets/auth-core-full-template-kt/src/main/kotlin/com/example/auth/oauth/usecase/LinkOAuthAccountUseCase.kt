package com.example.auth.oauth.usecase

import com.example.auth.oauth.entity.OAuthAccount
import com.example.auth.oauth.provider.OAuthTokenProvider
import com.example.auth.oauth.repository.OAuthAccountRepository
import com.example.auth.user.query.FindUserByIdQuery

class LinkOAuthAccountUseCase(
    private val oauthRepository: OAuthAccountRepository,
    private val tokenProvider: OAuthTokenProvider,
    private val findUserById: FindUserByIdQuery
) {
    suspend fun execute(userId: String, provider: String, token: String): Result<OAuthAccount> {
        findUserById.findById(userId)
            ?: return Result.failure(IllegalArgumentException("USER_NOT_FOUND"))

        val userInfo = tokenProvider.validateToken(provider, token)
            .getOrElse { return Result.failure(it) }

        val existing = oauthRepository.findByProviderAndAccountId(provider, userInfo.providerAccountId)
        if (existing != null) {
            return Result.failure(IllegalArgumentException("OAUTH_ACCOUNT_ALREADY_LINKED"))
        }

        val account = OAuthAccount.create(
            userId = userId,
            provider = provider,
            providerAccountId = userInfo.providerAccountId
        )
        oauthRepository.create(account).getOrElse { return Result.failure(it) }
        return Result.success(account)
    }
}
