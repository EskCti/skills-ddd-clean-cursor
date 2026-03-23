package com.example.shared.domain.vo

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class EmailTest {

    @Test
    fun `should create email with normalized lowercase value`() {
        val email = Email.create("  John@Example.COM  ")
        assertEquals("john@example.com", email.value)
    }

    @Test
    fun `should extract local part`() {
        val email = Email.create("user@domain.com")
        assertEquals("user", email.local)
    }

    @Test
    fun `should extract domain part`() {
        val email = Email.create("user@domain.com")
        assertEquals("domain.com", email.domain)
    }

    @Test
    fun `should fail for invalid email format`() {
        val result = Email.tryCreate("not-an-email")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should fail for email without domain`() {
        val result = Email.tryCreate("user@")
        assertTrue(result.isFailure)
    }

    @Test
    fun `should throw on create with invalid value`() {
        assertThrows<IllegalArgumentException> { Email.create("invalid") }
    }
}
