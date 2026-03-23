package com.example.auth.oauth.usecase

import com.example.auth.oauth.repository.OAuthAccountRepository

class UnlinkOAuthAccountUseCase(
    private val oauthRepository: OAuthAccountRepository
) {
    suspend fun execute(accountId: String): Result<Unit> {
        return oauthRepository.delete(accountId)
    }
}
