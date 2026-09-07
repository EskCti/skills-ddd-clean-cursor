package com.example.auth.domain.service

import com.example.auth.domain.entity.Password
import com.example.auth.domain.provider.PasswordCryptoProvider
import com.example.shared.domain.result.DomainResult
import com.example.shared.domain.vo.StrongPassword

class PasswordChangePolicyService(
    private val crypto: PasswordCryptoProvider
) {
    suspend fun validate(
        newPlainPassword: String,
        recentPasswords: List<Password>
    ): DomainResult<Unit> {
        val errors = StrongPassword.tryCreate(newPlainPassword).errors.toMutableList()

        for (recent in recentPasswords) {
            if (crypto.compare(newPlainPassword, recent.hash.value)) {
                errors.add("PASSWORD_RECENTLY_USED")
                break
            }
        }

        if (errors.isNotEmpty()) {
            return DomainResult.failure(errors)
        }
        return DomainResult.success(Unit)
    }
}