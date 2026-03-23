package com.example.modules.auth.adapter

import com.example.auth.password.provider.PasswordCryptoProvider
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
