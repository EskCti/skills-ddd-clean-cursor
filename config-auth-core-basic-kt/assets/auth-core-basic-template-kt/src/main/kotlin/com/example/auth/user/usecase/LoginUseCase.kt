package com.example.auth.user.usecase

import com.example.auth.password.provider.PasswordCryptoProvider
import com.example.auth.user.dto.UserDto
import com.example.auth.user.query.FindPasswordHashQuery
import com.example.auth.user.query.FindUserByEmailQuery

class LoginUseCase(
    private val findUserByEmail: FindUserByEmailQuery,
    private val findPasswordHash: FindPasswordHashQuery,
    private val crypto: PasswordCryptoProvider
) {
    suspend fun execute(email: String, plainPassword: String): Result<UserDto> {
        val user = findUserByEmail.findByEmail(email)
            ?: return Result.failure(IllegalArgumentException("INVALID_CREDENTIALS"))
        val hash = findPasswordHash.findPasswordHash(user.id)
            ?: return Result.failure(IllegalArgumentException("INVALID_CREDENTIALS"))
        if (!crypto.compare(plainPassword, hash)) {
            return Result.failure(IllegalArgumentException("INVALID_CREDENTIALS"))
        }
        return Result.success(user)
    }
}
