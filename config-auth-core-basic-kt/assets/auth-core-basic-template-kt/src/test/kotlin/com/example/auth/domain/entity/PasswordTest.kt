package com.example.auth.domain.entity

import org.junit.jupiter.api.Test
import kotlin.test.assertTrue

class PasswordTest {

    private val validHash = "\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
    private val validUserId = "550e8400-e29b-41d4-a716-446655440000"

    @Test
    fun `should create password with valid bcrypt hash`() {
        val result = Password.tryCreate(userId = validUserId, hash = validHash)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should fail with plain text password`() {
        val result = Password.tryCreate(userId = validUserId, hash = "plaintext123")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail with invalid user id`() {
        val result = Password.tryCreate(userId = "invalid", hash = validHash)
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail with blank user id`() {
        val result = Password.tryCreate(userId = "", hash = validHash)
        assertTrue(result.isFailure)
    }
}