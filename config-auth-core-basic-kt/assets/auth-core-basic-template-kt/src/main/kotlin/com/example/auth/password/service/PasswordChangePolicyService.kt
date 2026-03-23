package com.example.auth.password.service

import com.example.auth.password.entity.Password
import com.example.auth.password.provider.PasswordCryptoProvider

class PasswordChangePolicyService(
    private val crypto: PasswordCryptoProvider
) {
    suspend fun validate(
        newPlainPassword: String,
        recentPasswords: List<Password>
    ): Result<Unit> {
        if (newPlainPassword.length < 8) {
            return Result.failure(IllegalArgumentException("PASSWORD_TOO_SHORT"))
        }
        if (!newPlainPassword.any { it.isUpperCase() } ||
            !newPlainPassword.any { it.isLowerCase() } ||
            !newPlainPassword.any { it.isDigit() } ||
            !newPlainPassword.any { !it.isLetterOrDigit() }
        ) {
            return Result.failure(IllegalArgumentException("WEAK_PASSWORD"))
        }
        for (recent in recentPasswords) {
            if (crypto.compare(newPlainPassword, recent.hash.value)) {
                return Result.failure(IllegalArgumentException("PASSWORD_RECENTLY_USED"))
            }
        }
        return Result.success(Unit)
    }
}
