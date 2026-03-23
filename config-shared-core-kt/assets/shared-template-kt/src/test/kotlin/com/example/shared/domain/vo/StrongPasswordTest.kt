package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertTrue

class StrongPasswordTest {

    @Test
    fun `should accept a strong password`() {
        val result = StrongPassword.tryCreate("Abc123!@#")
        assertTrue(result.isSuccess)
    }

    @Test
    fun `should fail for password shorter than 8 characters`() {
        val result = StrongPassword.tryCreate("Abc1!@")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for password without uppercase`() {
        val result = StrongPassword.tryCreate("abcdef1!@")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for password without lowercase`() {
        val result = StrongPassword.tryCreate("ABCDEF1!@")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for password without digits`() {
        val result = StrongPassword.tryCreate("Abcdefgh!@")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for password without special characters`() {
        val result = StrongPassword.tryCreate("Abcdef123")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should throw on create with weak password`() {
        assertThrows<IllegalArgumentException> { StrongPassword.create("weak") }
    }
}
