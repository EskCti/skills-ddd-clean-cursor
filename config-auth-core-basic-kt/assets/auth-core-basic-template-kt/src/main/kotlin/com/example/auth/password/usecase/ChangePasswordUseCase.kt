package com.example.auth.password.usecase

import com.example.auth.application.query.UserExistsQuery
import com.example.auth.password.entity.Password
import com.example.auth.password.provider.PasswordCryptoProvider
import com.example.auth.password.repository.PasswordRepository
import com.example.auth.password.service.PasswordChangePolicyService

class ChangePasswordUseCase(
    private val userExists: UserExistsQuery,
    private val passwordRepository: PasswordRepository,
    private val crypto: PasswordCryptoProvider,
    private val policy: PasswordChangePolicyService
) {
    suspend fun execute(userId: String, newPlainPassword: String): Result<Unit> {
        if (!userExists.existsByEmail(userId)) {
            return Result.failure(IllegalArgumentException("USER_NOT_FOUND"))
        }
        val recentPasswords = passwordRepository.findRecentByUserId(userId)
        policy.validate(newPlainPassword, recentPasswords).getOrElse { return Result.failure(it) }

        val hash = crypto.hash(newPlainPassword)
        val password = Password.create(userId = userId, hash = hash)
        return passwordRepository.create(password)
    }
}
