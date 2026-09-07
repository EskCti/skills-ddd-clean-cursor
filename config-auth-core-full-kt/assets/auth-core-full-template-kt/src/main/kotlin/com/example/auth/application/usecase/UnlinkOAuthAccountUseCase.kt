package com.example.auth.application.usecase

import com.example.auth.domain.repository.OAuthAccountRepository
import com.example.shared.domain.result.DomainResult

class UnlinkOAuthAccountUseCase(
    private val oauthRepository: OAuthAccountRepository
) {
    suspend fun execute(accountId: String): DomainResult<Unit> {
        return oauthRepository.delete(accountId)
    }
}