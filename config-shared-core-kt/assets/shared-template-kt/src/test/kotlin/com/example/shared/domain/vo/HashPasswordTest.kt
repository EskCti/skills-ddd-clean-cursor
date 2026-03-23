package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertTrue

class HashPasswordTest {

    @Test
    fun `should accept valid bcrypt hash with 2a prefix`() {
        val hash = "\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        val result = HashPassword.tryCreate(hash)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should accept valid bcrypt hash with 2b prefix`() {
        val hash = "\$2b\$12\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        val result = HashPassword.tryCreate(hash)
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should fail for plain text password`() {
        val result = HashPassword.tryCreate("mypassword123")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for empty string`() {
        val result = HashPassword.tryCreate("")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should throw on create with invalid hash`() {
        assertThrows<IllegalArgumentException> { HashPassword.create("not-a-hash") }
    }
}
