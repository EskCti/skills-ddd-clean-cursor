package com.example.auth.application.usecase

import com.example.auth.application.query.UserExistsQuery
import com.example.auth.domain.entity.Password
import com.example.auth.domain.provider.PasswordCryptoProvider
import com.example.auth.domain.repository.PasswordRepository
import com.example.auth.domain.service.PasswordChangePolicyService
import com.example.shared.application.UseCase
import com.example.shared.domain.result.DomainResult

data class ChangePasswordInput(
    val userId: String,
    val newPlainPassword: String
)

class ChangePasswordUseCase(
    private val userExists: UserExistsQuery,
    private val passwordRepository: PasswordRepository,
    private val crypto: PasswordCryptoProvider,
    private val policy: PasswordChangePolicyService
) : UseCase<ChangePasswordInput, Unit> {
    override suspend fun execute(data: ChangePasswordInput): DomainResult<Unit> {
        if (!userExists.existsById(data.userId)) {
            return DomainResult.failure(listOf("USER_NOT_FOUND"))
        }
        val recentPasswords = passwordRepository.findRecentByUserId(data.userId)
        val policyErrors = policy.validate(data.newPlainPassword, recentPasswords).errors
        if (policyErrors.isNotEmpty()) {
            return DomainResult.failure(policyErrors)
        }

        val hash = crypto.hash(data.newPlainPassword)
        val password = Password.create(userId = data.userId, hash = hash)
        return passwordRepository.create(password)
    }
}