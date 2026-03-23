package com.example.auth.password.usecase

import com.example.auth.application.query.UserExistsQuery
import com.example.auth.password.entity.Password
import com.example.auth.password.provider.PasswordCryptoProvider
import com.example.auth.password.repository.PasswordRepository
import com.example.auth.password.service.PasswordChangePolicyService
import com.example.shared.application.UseCase

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
    override suspend fun execute(data: ChangePasswordInput): Result<Unit> {
        if (!userExists.existsById(data.userId)) {
            return Result.failure(IllegalArgumentException("USER_NOT_FOUND"))
        }
        val recentPasswords = passwordRepository.findRecentByUserId(data.userId)
        policy.validate(data.newPlainPassword, recentPasswords).getOrElse { return Result.failure(it) }

        val hash = crypto.hash(data.newPlainPassword)
        val password = Password.create(userId = data.userId, hash = hash)
        return passwordRepository.create(password)
    }
}
