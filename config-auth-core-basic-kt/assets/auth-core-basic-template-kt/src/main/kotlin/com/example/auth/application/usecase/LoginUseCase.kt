package com.example.auth.application.usecase

import com.example.auth.application.dto.UserDto
import com.example.auth.application.query.FindPasswordHashQuery
import com.example.auth.application.query.FindUserByEmailQuery
import com.example.auth.domain.provider.PasswordCryptoProvider
import com.example.shared.domain.result.DomainResult

class LoginUseCase(
    private val findUserByEmail: FindUserByEmailQuery,
    private val findPasswordHash: FindPasswordHashQuery,
    private val crypto: PasswordCryptoProvider
) {
    suspend fun execute(email: String, plainPassword: String): DomainResult<UserDto> {
        val user = findUserByEmail.findByEmail(email)
            ?: return DomainResult.failure(listOf("INVALID_CREDENTIALS"))
        val hash = findPasswordHash.findPasswordHash(user.id)
            ?: return DomainResult.failure(listOf("INVALID_CREDENTIALS"))
        if (!crypto.compare(plainPassword, hash)) {
            return DomainResult.failure(listOf("INVALID_CREDENTIALS"))
        }
        return DomainResult.success(user)
    }
}