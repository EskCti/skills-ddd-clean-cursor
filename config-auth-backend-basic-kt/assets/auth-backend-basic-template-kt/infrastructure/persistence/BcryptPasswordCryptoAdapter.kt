package com.example.modules.auth.infrastructure.persistence

import com.example.auth.domain.provider.PasswordCryptoProvider
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class BcryptPasswordCryptoAdapter(
    private val passwordEncoder: PasswordEncoder
) : PasswordCryptoProvider {

    override suspend fun hash(plainPassword: String): String =
        passwordEncoder.encode(plainPassword)

    override suspend fun compare(plainPassword: String, hashedPassword: String): Boolean =
        passwordEncoder.matches(plainPassword, hashedPassword)
}