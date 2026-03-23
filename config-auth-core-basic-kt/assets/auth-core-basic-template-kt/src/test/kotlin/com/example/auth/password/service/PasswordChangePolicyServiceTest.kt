package com.example.auth.password.service

import com.example.auth.password.entity.Password
import com.example.auth.password.provider.PasswordCryptoProvider
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class PasswordChangePolicyServiceTest {

    private val fakeCrypto = object : PasswordCryptoProvider {
        override suspend fun hash(plainPassword: String): String =
            "\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

        override suspend fun compare(plainPassword: String, hashedPassword: String): Boolean =
            plainPassword == "reused-password"
    }

    private val service = PasswordChangePolicyService(fakeCrypto)

    @Test
    fun `should accept strong new password`() = runBlocking {
        val result = service.validate("NewStr0ng!Pass", emptyList())
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should reject short password`() = runBlocking {
        val result = service.validate("Sh1!", emptyList())
        assertTrue(result.isFailure)
    }

    @Test
    fun `should reject weak password without uppercase`() = runBlocking {
        val result = service.validate("weakpass1!", emptyList())
        assertTrue(result.isFailure)
    }

    @Test
    fun `should reject recently used password`() = runBlocking {
        val recentHash = "\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        val recent = Password.create(
            userId = "550e8400-e29b-41d4-a716-446655440000",
            hash = recentHash
        )
        val result = service.validate("reused-password", listOf(recent))
        assertTrue(result.isFailure)
    }
}
