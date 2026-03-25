package com.example.auth.password.service

import com.example.auth.password.entity.Password
import com.example.auth.password.provider.PasswordCryptoProvider
import com.example.shared.domain.vo.StrongPassword

class PasswordChangePolicyService(
    private val crypto: PasswordCryptoProvider
) {
    suspend fun validate(
        newPlainPassword: String,
        recentPasswords: List<Password>
    ): Result<Unit> {
        StrongPassword.tryCreate(newPlainPassword)
            .getOrElse { return Result.failure(it) }

        for (recent in recentPasswords) {
            if (crypto.compare(newPlainPassword, recent.hash.value)) {
                return Result.failure(IllegalArgumentException("PASSWORD_RECENTLY_USED"))
            }
        }
        return Result.success(Unit)
    }
}
